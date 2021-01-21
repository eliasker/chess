const express = require('express')
const path = require('path')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const PORT = 3001 // TODO: add process.env variable

let userCount = 0

io.on('connection', (socket) => {
  userCount++
  const current = userCount
  console.log(`user ${current} connected`)

  socket.on('disconnect', () => {
    console.log(`user ${current} disconnected`)
  })

  socket.on('chat message', (msg) => {
    console.log(`user ${current}: ${msg}`)
    io.emit('chat message: ', msg)
  }) 
/*
  socket.on('move', (move) => {
    console.log(`user ${current} made a move: ${move}`)
    io.emit('move', move)
  })
*/
  socket.on('move', (fen) => {
    console.log(`user ${current} sent this fenstate ${fen}`)
    io.emit('move', fen)
  })
})


app.use(express.static(path.resolve(__dirname, '../chess-client/build')))

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../chess-client/build', 'index.html'))
})

http.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
