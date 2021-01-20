const express = require('express')
const path = require('path')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const PORT = 3001 // TODO: add process.env variable

let userCount = 0

app.use(express.static(path.resolve(__dirname, '../chess-client/build')))

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../chess-client/build', 'index.html'))
})

http.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
