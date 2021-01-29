import { useRef, useState, useEffect } from 'react'
import io from 'socket.io-client'

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
    socket.current = io(ENDPOINT)
    socket.current.emit('join server', { userID: userID, username: username })
    socket.current.on('update users', data => console.log(data))

    return () => { socket.current.disconnect(userID) }
  }, [userID, username])

  return { connectedUsers, currentGames }

}

export default SocketHook
