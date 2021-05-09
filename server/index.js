const express = require('express')
const path = require('path')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http, { cors: { origin: "*" } })
const PORT = process.env.PORT || 3001

const { Player } = require('./src/Player')
const { GameManager } = require('./src/GameManager')
const manager = new GameManager()
const connectedUsers = {}
let serverInterval = null

/**
 * When client connects to the server 'connection' event is fired
 * Users are added to connectedUsers using the sockets id as key
 */
io.on('connection', socket => {

  socket.emit('update games', manager.getListOfGames())

  /**
   * Function that updates timers in each game once per interval
   * If there are no games the interval is cleared
   * Timers are only updated if game uses them
   * If player runs out of time the manager marks that player as loser
   * Then updated game is sent to each connected socket
   */
  const updateGameTimes = () => {
    const numberOfGames = manager.getListOfGames().length
    if (numberOfGames === 0) {
      clearInterval(serverInterval)
    } else {
      const games = manager.getListOfGames()

      games.forEach(game => {
        if (game.time !== null && game.winner === null && game.player.id !== null) {
          const playerInTurn = game.turn === game.host.color[0] ? game.host : game.player

          if (playerInTurn.time > 0) {
            playerInTurn.subtractTime(1000)
          } else {
            manager.handleGameOver(playerInTurn.id, game.id, 'loss')
          }

          for (let socketID of game.connections) {
            io.to(socketID).emit('game update', game)
          }
        }
      })
    }
  }


  const startInterval = () => serverInterval = setInterval(updateGameTimes, 1000)
  

  /**
   * If disconnected user hosted any games those games are terminated
   * Then user is removed from connectedUsers
   */
  socket.on('disconnect', () => {
    if (connectedUsers[socket.id]?.hosts.size > 0) {
      for (let gameID of connectedUsers[socket.id].hosts) {
        manager.removeGame(gameID)
      }
    }
    delete connectedUsers[socket.id]
    io.emit('update users', connectedUsers)
    io.emit('update games', manager.getListOfGames())
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
   * @callback callback - currently sends back boolean that tells client if room was accepted
   * 
   * When first game is created the server starts a interval that updates timers in each game
   */
  socket.on('create game', (newGameRoom, callback) => {
    if (connectedUsers[socket.id]?.hosts.size > 2) {
      callback({
        successful: false,
        message: 'You have already created 3 games'
      })
    } else if (connectedUsers[socket.id]) {
      newGameRoom.connections = new Set([socket.id])
      newGameRoom.host = new Player(
        newGameRoom.host.id,
        newGameRoom.host.name,
        newGameRoom.host.color,
        newGameRoom.host.time
      )
      connectedUsers[socket.id]?.hosts.add(newGameRoom.id)

      manager.addGame(newGameRoom)

      callback({
        successful: true,
        message: 'ok'
      })

      if (manager.getListOfGames().length === 1) startInterval()

      io.emit('update games', manager.getListOfGames())
    }
  })

  /**
   * Event that is sent when user joins to a game
   * @param {boolean} joinAsPlayer - player or spectator 
   * Manager adds user to the game
   * Updated games is sent to everyone 
   */
  socket.on('join game', (user, gameID, joinAsPlayer) => {
    manager.addUser(user, socket.id, gameID, joinAsPlayer)
    io.emit('game update', manager.getGameByID(gameID))
    io.emit('update games', manager.getListOfGames())
  })

  /**
   * Manager removes user from game
   * Game is removed from userlists 'this player hosts these games' -list
   * TODO: if host leaves send 'game closed: host left' -notification
   */
  socket.on('leave game', (userID, gameID) => {
    manager.removeUser(userID, gameID, socket.id)
    connectedUsers[socket.id]?.hosts.delete(gameID)
    io.emit('update games', manager.getListOfGames())
    io.emit('game update', manager.getGameByID(gameID))
  })

  /**
   * Server receives this event after a game ends
   * manager updates game by adding score and setting the 'game over status'
   * @param {string} playerID - player who played the move
   * @param {string} result -  did player win, draw or lose
   */
  socket.on('game over', (gameID, playerID, result) => {
    manager.handleGameOver(playerID, gameID, result)
    io.emit('game update', manager.getGameByID(gameID))
  })

  /**
   * Player starts a new game
   */
  socket.on('new game', (gameID) => {
    manager.restartGame(gameID)
    io.emit('game update', manager.getListOfGames())
  })

  /** 
   * A move is sent to server after client side validation (legality & sent by correct player) as a 
   * @param {string} newState - describes where pieces are on board
   * Every client that is connected receives updated game
   */
  socket.on('move', (gameID, newState, userID) => {
    manager.updateBoardState(userID, gameID, newState)
    const game = manager.getGameByID(gameID)
    for (let socketID of game.connections) {
      io.to(socketID).emit('game update', game)
    }
    io.emit('update games', manager.getListOfGames())
  })
})

app.use(express.static(path.resolve(__dirname, './build')))

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './build', 'index.html'))
})

http.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
