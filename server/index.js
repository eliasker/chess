const express = require('express')
//const path = require('path')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http, { cors: { origin: "*" } })
const PORT = process.env.PORT || 3001 // TODO: add process.env variable

const { Player } = require('./src/Player')

const games = {}
const connectedUsers = {}

/**
 * When client connects to the server 'connection' event is fired
 * Users are added to connectedUsers using the sockets id as key
 */
io.on('connection', socket => {
  socket.emit('update games', games)

  // TODO: Check if disconnecting user is playing (or spectating)
  socket.on('disconnect', () => {
    delete connectedUsers[socket.id]
    io.emit('update users', connectedUsers)
  })

  /**
   * After connecting client emits his data (id, username) with 'join server' event
   * User is added to connectedUsers object using her sockets id as key
   * Updated connectedUsers is then sent to everyone
   */
  socket.on('join server', (user) => {
    connectedUsers[socket.id] = user
    io.emit('update users', connectedUsers)
  })

  /**
   * When user creates game newGameRoom object is sent to server
   * It has default chess board position and 
   * Host is replaced with Player object that has same id and color
   * newGameRoom is added to games which is then sent to everyone
   */
  socket.on('create game', (newGameRoom) => {
    newGameRoom.connections = new Set()
    newGameRoom.connections.add(socket.id)
    games[newGameRoom.id] = newGameRoom
    newGameRoom.host = new Player(newGameRoom.host.id, newGameRoom.host.color)
    io.emit('update games', games)
  })

  /**
   * Event that is sent when user joins to game
   * @param {boolean} isPlayer - player or spectator 
   * If isPlayer is true a new Player object is created and added as player to the game
   * (Only host and player can play game and only single user can join as a player)
   * Socket is added to games connections for listening events
   * Updated games is sent to everyone 
   */
  socket.on('join game', (userID, gameID, isPlayer) => {
    if (!games[gameID]) return
    games[gameID].connections.add(socket.id)
    if (isPlayer) {
      const newPlayer = new Player(userID,
        games[gameID].host.color === "white" ? "black" : "white")
      games[gameID].player = newPlayer
    }
    io.emit('game update', games[gameID])
    io.emit('update games', games)
  })

  /**
   * If player leaves default player is put in leavers place
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
      delete games[gameID]
    }

    io.emit('update games', games)
    io.emit('game update', games[gameID])
  })

  /**
   * Server receives this event after a game ending move has been played
   * Updates player scores. Winner gets 1 and in case of a draw both players get 0.5
   * @param {string} playerID player who played the move
   * @param {boolean} isWinner did player win or cause a draw
   */
  socket.on('game over', (gameID, playerID, isWinner) => {
    if (isWinner) {
      if (games[gameID].host.id === playerID) {
        games[gameID].host.addScore(1)
      } else {
        games[gameID].player.addScore(1)
      }
    } else {
      games[gameID].host.addScore(0.5)
      games[gameID].player.addScore(0.5)

    }
    io.emit('game update', games[gameID])
    io.emit('update games', games)
  })

  socket.on('close game', (gameID) => {
    delete games[gameID]
    io.emit('update games', games)
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

/*
app.use(express.static(path.resolve(__dirname, '../chess-client/build')))

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../chess-client/build', 'index.html'))
})
*/

http.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
