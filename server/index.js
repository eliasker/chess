const express = require('express')
const path = require('path')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http, { cors: { origin: "*" } })
const PORT = process.env.PORT || 3001

const { Player } = require('./src/Player')

const games = {}
const connectedUsers = {}
let serverInterval = null

/**
 * When client connects to the server 'connection' event is fired
 * Users are added to connectedUsers using the sockets id as key
 */
io.on('connection', socket => {
  socket.emit('update games', games)

  const updateGameTimes = () => {
    const numberOfGames = Object.keys(games).length
    if (numberOfGames === 0) {
      clearInterval(serverInterval)
      console.log('clearing interval')
    } else {
      Object.keys(games).forEach(gameID => {
        const current = games[gameID]
        if (current.time !== null && current.winner === null && current.player.id !== null) {
          const playerInTurn = current.turn === current.host.color[0] ? current.host : current.player
          playerInTurn.time > 0 ?
            playerInTurn.subtractTime(100) :
            handleGameOverEvent(current.id, playerInTurn.id, 'loss')
        }
      })
    }
  }

  const startInterval = () => {
    serverInterval = setInterval(updateGameTimes, 100)
  }

  /**
   * Updates player scores. Winner gets 1 and in case of a draw both players get 0.5
   * and sets games winner status
   * @param {*} gameID What game ended
   * @param {*} playerID Who caused game to end
   * @param {*} result Game ended in 'win', 'draw' or 'losss'
   */
  const handleGameOverEvent = (gameID, playerID, result) => {
    const isHost = () => games[gameID].host?.id === playerID
    const game = games[gameID]
    switch (result) {
      case 'win':
        isHost() ? game.host.addScore(1) : game.player.addScore(1)
        game.winner = isHost() ? game.host.username : game.player.username
        break;

      case 'draw':
        game.host.addScore(0.5)
        game.player.addScore(0.5)
        game.winner = 'draw'
        break;

      case 'loss':
        isHost() ? game.player.addScore(1) : game.host.addScore(1)
        game.winner = isHost() ? game.player.username : game.host.username
        break;

      default:
        break;
    }

    io.emit('game update', games[gameID])
    io.emit('update games', games)
  }


  /**
   * If disconnected user hosted any games those games are terminated
   * Then user is removed from connectedUsers
   */
  socket.on('disconnect', () => {
    if (connectedUsers[socket.id]?.hosts.size > 0) {
      for (let gameID of connectedUsers[socket.id].hosts) {
        delete games[gameID]
      }
    }
    delete connectedUsers[socket.id]
    io.emit('update users', connectedUsers)
    io.emit('update games', games)
  })

  /**
   * After connecting client emits his data (id, username) with 'join server' event
   * User is added to connectedUsers object using her sockets id as key
   * Updated connectedUsers is then sent to everyone
   */
  socket.on('join server', (user) => {
    connectedUsers[socket.id] = { ...user, hosts: new Set() }
    io.emit('update users', connectedUsers)
  })

  /**
   * When user creates game a newGameRoom object is sent to server
   * Server limits game creation per user to 3
   * @param {newGameRoom} newGameRoom - object that has default chessboard position hosts data
   * Host is replaced with a Player object that has same id and color
   * newGameRoom is added to games which is then sent to everyone
   * @callback callback - currently sends back boolean that tells client if room was accepted
   */
  socket.on('create game', (newGameRoom, callback) => {
    if (connectedUsers[socket.id]?.hosts.size > 2) {
      callback({
        successful: false,
        message: 'You have already created 3 games'
      })
    } else if (connectedUsers[socket.id]) {
      newGameRoom.connections = new Set([socket.id])
      games[newGameRoom.id] = newGameRoom
      newGameRoom.host = new Player(
        newGameRoom.host.id,
        newGameRoom.host.username,
        newGameRoom.host.color,
        newGameRoom.host.time
      )
      connectedUsers[socket.id]?.hosts.add(newGameRoom.id)
      callback({
        successful: true,
        message: 'ok'
      })

      if (Object.keys(games).length === 1) startInterval()

      io.emit('update games', games)
    }
  })

  /**
   * Event that is sent when user joins to game
   * @param {boolean} isPlayer - player or spectator 
   * If isPlayer is true a new Player object is created and added as player to the game
   * (Only host and player can play game and only single user can join as a player)
   * Socket is added to games connections for listening events
   * Updated games is sent to everyone 
   */
  socket.on('join game', (user, gameID, isPlayer) => {
    if (!games[gameID]) return
    games[gameID].connections.add(socket.id)
    if (isPlayer) {
      const newPlayer = new Player(user.userID, user.username,
        games[gameID].host.color === 'white' ? 'black' : 'white',
        games[gameID].time)
      games[gameID].player = newPlayer
    }
    io.emit('game update', games[gameID])
    io.emit('update games', games)
  })

  /**
   * If user is player then default player is put into leavers place
   * Else if user is host then game is terminated
   * TODO: if host leaves send 'game closed: host left' -notification
   */
  socket.on('leave game', (userID, gameID) => {
    if (!games[gameID]) return

    games[gameID].connections.delete(socket.id)
    if (userID === games[gameID].player.id) {
      games[gameID].player = {
        time: 0,
        score: 0,
        id: null,
        color: ""
      }
    } else if (userID === games[gameID].host.id) {
      connectedUsers[socket.id]?.hosts.delete(gameID)
      delete games[gameID]
    }

    io.emit('update games', games)
    io.emit('game update', games[gameID])
  })

  /**
   * Server receives this event after a game ends
   * then calls handler function
   * @param {string} playerID - player who played the move
   * @param {string} result -  did player win, draw or lose
   */
  socket.on('game over', (gameID, playerID, result) => {
    handleGameOverEvent(gameID, playerID, result)
  })

  /**
   * Change colors, reset winner status, reset timers
   */
  socket.on('new game', (gameID) => {
    games[gameID].host.changeColor()
    games[gameID].host.setTime(games[gameID].time)
    games[gameID].player.changeColor()
    games[gameID].player.setTime(games[gameID].time)
    games[gameID].winner = null
    games[gameID].turn = 'w'
    io.emit('game update', games[gameID])
  })

  /** 
   * A move is sent to server after client side validation (legality & sent by correct player) as a 
   * @param {string} newState - describes where pieces are on board
   * Every client that is connected receives updated game
   */
  socket.on('move', (gameID, newState, userID) => {
    if (games[gameID] === undefined) return

    games[gameID] = { ...games[gameID], state: newState }
    const isHost = games[gameID].host.id === userID

    games[gameID].turn = games[gameID].turn === 'w' ? 'b' : 'w'
    if (games[gameID].increment !== null) {
      isHost ?
        games[gameID].host.addTime(games[gameID].increment) :
        games[gameID].player.addTime(games[gameID].increment)
    }

    for (let socketID of games[gameID].connections) {
      io.to(socketID).emit('game update', games[gameID])
    }
    io.emit('update games', games)
  })
})

app.use(express.static(path.resolve(__dirname, './build')))

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './build', 'index.html'))
})

http.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
