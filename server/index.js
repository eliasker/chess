const express = require('express')
//const path = require('path')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http, { cors: { origin: "*" } })
const PORT = process.env.PORT || 3001 // TODO: add process.env variable

const { Player } = require('./src/Player')

const games = {}
const connectedUsers = {}

// TODO: disconnect users from connections properly
// TODO: dont allow duplicate socket ids in connections
/**
 * When client connects to the server 'connection' event is fired
 * Users are added to connectedUsers using the sockets id as key
 */
io.on('connection', socket => {
  socket.emit('update games', games, null, null)
  socket.emit('update users', connectedUsers)

  // TODO: Check if disconnecting user is playing (or spectating)
  socket.on('disconnect', () => {
    delete connectedUsers[socket.id]
    io.emit('update users', connectedUsers)
  })

  socket.on('join server', (user) => {
    connectedUsers[socket.id] = user
    io.emit('update users', connectedUsers)
  })

  socket.on('create game', (hostID, newGameRoom) => {
    newGameRoom.connections.push(socket.id)
    games[newGameRoom.id] = newGameRoom
    const host = new Player(hostID, newGameRoom.hostColor)
    newGameRoom.host = host
    io.emit('update games', games)
  })

  socket.on('join game', (userID, gameID, isPlayer) => {
    if (!games[gameID]) return
    games[gameID].connections.push(socket.id)
    if (isPlayer) {
      games[gameID].playerID = userID
      const player = new Player(userID,
        games[gameID].host.color === "white" ? "black" : "white")
      games[gameID].player = player
      io.emit('player event', gameID, userID)

    }
    io.emit('update games', games)
  })

  // TODO: if host leaves --> close game
  // else remove leaving user from game connections 
  // add free spot if non hostplayer leaves
  socket.on('leave game', (userID, gameID) => {
    if (!games[gameID]) return
    if (userID === games[gameID].playerID) {
      games[gameID].playerID = null
    }

    const newConnections = games[gameID].connections
    const socketIDIndex = newConnections.indexOf(socket.id)
    if (socketIDIndex >= 0) games[gameID].connections.splice(socketIDIndex, 1)
    io.emit('update games', games)
    io.emit('player event', (gameID, null))
  })

  /**
   * Server receives this event after a game ending move has been played
   * Updates player scores. Winner gets 1 and in case of a draw both players get 0.5
   * @param {*} playerID player who played the move
   * @param {*} isWinner did player win or cause a draw
   * Fun fact: you can't technically play a game losing move
   */
  socket.on('game over', (gameID, playerID, isWinner) => {
    console.log('game over', gameID, playerID, isWinner)
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
    io.emit('update games', games)
  })

  socket.on('close game', (gameID) => {
    delete games[gameID]
    io.emit('update games', games)
  })

  // TODO: broadcast moves only to connected users
  socket.on('move', (gameID, newState) => {
    // TODO: error if game not found
    if (games[gameID] === undefined) return
    games[gameID] = { ...games[gameID], state: newState }
    io.emit('move', gameID, newState)
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
