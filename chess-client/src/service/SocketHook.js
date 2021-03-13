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

    return () => { socket.current.disconnect() }
  }, [userID, username])

  /**
   * Create game sends newGameRoom object to server
   * Server responses if creation was succesful
   * @param {gameRoom} newGameRoom
   * @returns {boolean}  response.succesful - No errors and user has less than 3 created games
   */
  const emitCreateGame = (newGameRoom) => {
    return new Promise((resolve) => {
      socket.current.emit('create game', newGameRoom, (response) => {
        resolve(response.successful)
      })
    })
  }

  const emitState = (gameID, newState) => {
    socket.current.emit('move', gameID, newState)
  }

  const emitJoin = (user, gameID, isPlayer) => {
    socket.current.emit('join game', user, gameID, isPlayer)
  }

  const emitRematch = (gameID) => {
    socket.current.emit('new game', gameID)
  }

  const emitLeave = (userID, gameID) => {
    socket.current.emit('leave game', userID, gameID)
  }

  const emitEnd = (gameID, userID, result) => {
    socket.current.emit('game over', gameID, userID, result)
  }

  return {
    connectedUsers,
    currentGames,
    emitCreateGame,
    emitState,
    gameUpdate,
    emitJoin,
    emitRematch,
    emitLeave,
    emitEnd
  }
}

export default SocketHook
