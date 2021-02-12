const express = require('express')
const path = require('path')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http, { cors: { origin: "*" } })
const PORT = process.env.PORT || 3001 // TODO: add process.env variable

let userCount = 0

const games = {}
const connectedUsers = {}

io.on('connection', socket => {
  userCount++
  const current = userCount

  socket.on('disconnect', (userID) => {
    delete connectedUsers[userID]
    userCount--
    io.emit('update users', connectedUsers)
    console.log('left server, online: ', connectedUsers)
  })

  socket.on('join server', (user) => {
    connectedUsers[user.userID] = user
    io.emit('update users', connectedUsers)
    console.log('joined, online: ', Object.keys(connectedUsers).length)
  })

  socket.on('chat message', (msg) => {
    console.log(`user ${current}: ${msg}`)
    io.emit('chat message: ', msg)
  })

  socket.on('create game', (newGameRoom) => {
    games[newGameRoom.id] = newGameRoom
    io.emit('update games', games)
  })

  socket.on('close game', (gameID) => {
    delete games[gameID]
    io.emit('update games', games)
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
