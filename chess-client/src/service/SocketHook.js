import { useRef, useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'

import { initialGameroom } from '../Constants'

const ENDPOINT = 'http://localhost:3001/'

/**
 * Custom hook that handles moving data between client and server,
 * stores and updates states that contain users and games.
 */
const SocketHook = (userID, username, setErrorMessage) => {
  const [connectedUsers, setConnectedUsers] = useState([])
  const [currentGames, setCurrentGames] = useState([])
  const [gameUpdate, setGameUpdate] = useState(initialGameroom)
  const socket = useRef()

  /**
   * useEffect that handles receiving events from the server
   * and updating relevant states after receiving event.
   * Used endpoint depends if application was ran with 'chess-client> react-scripts start' (development) 
   * or with 'server> node index.js' (production) that uses files from server/build folder
   */
  useEffect(() => {
    socket.current = process.env.NODE_ENV === 'development' ? socketIOClient(ENDPOINT) : socketIOClient()
    socket.current.emit('join server', { userID: userID, username: username })

    socket.current.on('update users', newUserList => {
      setConnectedUsers(newUserList)
    })

    socket.current.on('update games', (newGameList) => {
      setCurrentGames(newGameList)
    })

    /**
     * 'game update' is only sent to users that whose socket is connected to that game
     * i.e. user is host or at some point joined/spectated the game
     */
    socket.current.on('game update', (updatedGame) => {
      setGameUpdate(updatedGame)
    })

    socket.current.on('connect_error', error => {
      setErrorMessage('Connection to server failed')
    })

    return () => { socket.current.disconnect() }
  }, [userID, username, setErrorMessage])

  /**
   * Create game sends newGameRoom object to server
   * Server responses if creation was succesful
   * @param {gameRoom} newGameRoom
   * @returns {Promise} resolve handles response from server
   */
  const emitCreateGame = (newGameRoom) => {
    return new Promise((resolve) => {
      socket.current.emit('create game', newGameRoom, (response) => {
        resolve({ success: response.successful, message: response.message })
      })
    })
  }

  /**
   * Functions that send events to the server
   */
  const emitState = (gameID, newState, userID, spentTime) => {
    console.log('move', spentTime)
    socket.current.emit('move', gameID, newState, userID, spentTime)
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
