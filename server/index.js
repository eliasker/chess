const express = require('express')
const path = require('path')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http, { cors: { origin: "*" } })
const PORT = process.env.PORT || 3001 

const { Player } = require('./src/Player')

const games = {}
const connectedUsers = {}

/**
 * When client connects to the server 'connection' event is fired
 * Users are added to connectedUsers using the sockets id as key
 */
io.on('connection', socket => {
  socket.emit('update games', games)

  /**
   * If disconnected user hosted any games those games are terminated TODO: overkill?
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
        newGameRoom.host.color
      )
      connectedUsers[socket.id]?.hosts.add(newGameRoom.id)
      callback({
        successful: true,
        message: 'ok'
      })
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
        games[gameID].host.color === "white" ? "black" : "white")
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
   * Server receives this event after a game ending move has been played
   * Updates player scores. Winner gets 1 and in case of a draw both players get 0.5
   * @param {string} playerID - player who played the move
   * @param {string} result -  did player win, draw or lose
   */
  socket.on('game over', (gameID, playerID, result) => {
    const isHost = () => games[gameID].host.id === playerID
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
  })

  /**
   * Change colors, reset winner status
   */
  socket.on('new game', (gameID) => {
    games[gameID].host.changeColor()
    games[gameID].player.changeColor()
    games[gameID].winner = null
    io.emit('game update', games[gameID])
  })

  /** 
   * A move is sent to server after client side validation (legality & sent by correct player) as a 
   * @param {string} newState - describes where pieces are on board
   * Every client that is connected receives updated game
   */
  socket.on('move', (gameID, newState) => {
    if (games[gameID] === undefined) return
    games[gameID] = { ...games[gameID], state: newState }
    for (let socketID of games[gameID].connections) {
      io.to(socketID).emit('game update', games[gameID])
    }
  })
})

app.use(express.static(path.resolve(__dirname, './build')))

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './build', 'index.html'))
})

http.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
