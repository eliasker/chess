import { useRef, useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'

const ENDPOINT = 'http://localhost:3001/'

// TODO: const createGame = () => {}
// TODO: const removeGame = () => {}
// TODO: const joinRoom = () => {}
// TODO: const leaveRoom = () => {}
// TODO: const move = () => {}
// TODO: const message = () => {}

const SocketHook = (userID, username) => {
  const [connectedUsers, setConnectedUsers] = useState([])
  const [currentGames, setCurrentGames] = useState([])
  const socket = useRef()

  useEffect(() => {
    socket.current = socketIOClient(ENDPOINT)
    socket.current.emit('join server', { userID: userID, username: username })
    socket.current.on('update users', newUserList => {
      setConnectedUsers(newUserList)
      console.log('users', newUserList)
    })

    socket.current.on('update games', newGameList => {
      setCurrentGames(newGameList)
      console.log('games', newGameList)
    })

    return () => { socket.current.disconnect(userID) }
  }, [userID, username])


  const emitCreateGame = (newGameRoom) => {
    console.log('emit create game', newGameRoom)
    socket.current.emit('create game', newGameRoom)
  }

  return { connectedUsers, currentGames, emitCreateGame }

}

export default SocketHook
