import { useRef, useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'

import { initialGameroom } from '../Constants'

const ENDPOINT = 'http://localhost:3001/'

/**
 * Custom hook that handles moving data between client and server
 */
const SocketHook = (userID, username) => {
  const [connectedUsers, setConnectedUsers] = useState([])
  const [currentGames, setCurrentGames] = useState([])
  const [gameUpdate, setGameUpdate] = useState(initialGameroom)
  const socket = useRef()

  useEffect(() => {
    socket.current = socketIOClient(ENDPOINT)
    socket.current.emit('join server', { userID: userID, username: username })

    socket.current.on('update users', newUserList => {
      setConnectedUsers(newUserList)
    })

    socket.current.on('update games', (newGameList) => {
      setCurrentGames(newGameList)
    })

    socket.current.on('game update', (updatedGame) => {
      setGameUpdate(updatedGame)
    })

    socket.current.on('close game', (newGameList) => {
      setCurrentGames(newGameList)
    })

    return () => { socket.current.disconnect() }
  }, [userID, username])

  const emitCreateGame = (newGameRoom) => {
    socket.current.emit('create game', newGameRoom)
  }

  const emitState = (gameID, newState) => {
    socket.current.emit('move', gameID, newState)
  }

  const emitJoin = (userID, gameID, isPlayer) => {
    socket.current.emit('join game', userID, gameID, isPlayer)
  }

  const emitLeave = (userID, gameID) => {
    socket.current.emit('leave game', userID, gameID)
  }

  const emitEnd = (gameID, userID, isWinner) => {
    socket.current.emit('game over', gameID, userID, isWinner)
  }

  const emitClose = (gameID) => {
    socket.current.emit('close game', gameID)
  }

  return {
    connectedUsers,
    currentGames,
    emitCreateGame,
    emitState,
    gameUpdate,
    emitJoin,
    emitLeave,
    emitEnd,
    emitClose
  }
}

export default SocketHook
