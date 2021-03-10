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
   * User can join into a game as a spectator or as a player
   * @param {*} isPlayer true or false 
   * If isPlayer is true a new Player object is created and added as player to the game
   * (Only host and player can play game and only single user can join as a player)
   * In both cases socket is added to games connections
   */
  socket.on('join game', (userID, gameID, isPlayer) => {
    if (!games[gameID]) return
    games[gameID].connections.add(socket.id)
    if (isPlayer) {
      const newPlayer = new Player(userID,
        games[gameID].host.color === "white" ? "black" : "white")
      games[gameID].player = newPlayer
      io.emit('game update', games[gameID])
    }
    io.emit('update games', games)
  })

  /**
   * If player leaves default player is put in leavers place
   * TODO: if host leaves --> close game
   */
  socket.on('leave game', (userID, gameID) => {
    if (!games[gameID]) return
    if (userID === games[gameID].player.id) {
      games[gameID].player = {
        time: 0,
        score: 0,
        id: null,
        color: ""
      }
    }

    games[gameID].connections.delete(socket.id)

    io.emit('update games', games)
    io.emit('game update', games[gameID])
  })

  /**
   * Server receives this event after a game ending move has been played
   * Updates player scores. Winner gets 1 and in case of a draw both players get 0.5
   * @param {*} playerID player who played the move
   * @param {*} isWinner did player win or cause a draw
   * Fun fact: you can't technically play a game losing move
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
   * Move is sent to server as validated client side (legality & sent by correct player)
   * @param {*} newState fen string that describes where pieces are on a chess board
   * TODO: broadcast moves only to connected users
   */
  socket.on('move', (gameID, newState) => {
    if (games[gameID] === undefined) return
    games[gameID] = { ...games[gameID], state: newState }
    io.emit('game update', games[gameID])
    io.emit('update games', games)
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
