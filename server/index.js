const express = require('express')
const path = require('path')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http, { cors: { origin: "*" } })
const PORT = process.env.PORT || 3001 // TODO: add process.env variable

let userCount = 0

const indexOfObject = (array, id) => {
  const found = array.find(item => item.id === id)
  return found ? array.indexOf(found) : -1
}

const removeItemAtIndex = (array, index) => array.splice(index, 1)

const games = []
const connectedUsers = []

// TODO: users joining / leaving game
// Socket events
io.on('connection', socket => {
  userCount++
  const current = userCount
  
  socket.on('disconnect', (userID) => {
    const index = indexOfObject(connectedUsers, userID)
    removeItemAtIndex(connectedUsers, index)
    userCount--
    io.emit('update users', connectedUsers)
    console.log('left server, online: ', connectedUsers)
  })

  socket.on('join server', (user) => {
    connectedUsers.push(user)
    io.emit('update users', connectedUsers)
    console.log('joined, online: ', connectedUsers)
  })

  socket.on('chat message', (msg) => {
    console.log(`user ${current}: ${msg}`)
    io.emit('chat message: ', msg)
  })

  socket.on('create game', (newGame) => {
    games.push(newGame)
    io.broadcast.emit('new game started', games)
    console.log('new game started:', games)
  })

  socket.on('close game', (gameID) => {
    const index = indexOfObject(games, gameID)
    removeItemAtIndex(games, index)
    io.broadcast.emit('game closed', games)
    console.log('game ended:', games)
  })

  // TODO: make game specific
  socket.on('game move', (fen) => {
    console.log(`user ${current} sent this fenstate ${fen}`)
    io.emit('game move', fen)
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
