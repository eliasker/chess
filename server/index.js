const express = require('express')
//const path = require('path')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http, { cors: { origin: "*" } })
const PORT = process.env.PORT || 3001 // TODO: add process.env variable

const games = {}
const connectedUsers = {}

io.on('connection', socket => {
  socket.emit('update games', games, null, null)
  socket.emit('update users', connectedUsers)

  socket.on('disconnect', () => {
    delete connectedUsers[socket.id]
    io.emit('update users', connectedUsers)
  })

  socket.on('join server', (user) => {
    connectedUsers[socket.id] = user
    io.emit('update users', connectedUsers)
  })

  socket.on('create game', (newGameRoom) => {
    newGameRoom.connections.push(socket.id)
    games[newGameRoom.id] = newGameRoom
    io.emit('update games', games)
  })

  socket.on('join game', (userID, gameID, isPlayer) => {
    if (!games[gameID]) return
    games[gameID].connections.push(socket.id)
    if (isPlayer) games[gameID].playerID = userID
    console.log(games)
    io.emit('update games', games)
  })

  // TODO: leave game
  // if host leaves --> close game
  // else remove leaving user from game connections 
  // add free spot if non hostplayer leaves

  socket.on('close game', (gameID) => {
    delete games[gameID]
    io.emit('update games', games)
  })

  // TODO: broadcast moves only to connected users
  socket.on('move', (gameID, newState) => {
    // TODO: error if game not found
    if (games[gameID] === undefined) return
    games[gameID] = { ...games[gameID], state: newState }
    const str2 = games[gameID].state
    console.log(gameID, '\n', str2, '\n')
    io.emit('update games', games, gameID, newState)
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
