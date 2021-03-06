import { useRef, useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'

const ENDPOINT = 'http://localhost:3001/'

/**
 * Custom hook that handles moving data between client and server
 */
const SocketHook = (userID, username) => {
  const [connectedUsers, setConnectedUsers] = useState([])
  const [currentGames, setCurrentGames] = useState([])
  const [incMove, setIncMove] = useState({ gameID: null, gameState: null })
  const [userUpdate, setUserUpdate] = useState({ gameID: null, playerID: null })
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

    // TODO: combine player event & move into updateGame event
    // connection
    // { gameID: gameID, ...gameUpdate, playerID: connectingUserID }
    // or move
    // { gameID: gameID, gameState: newState, ...gameUpdate  }
    socket.current.on('player event', (gameID, userID) => {
      setUserUpdate({ gameID: gameID, playerID: userID })
    })

    socket.current.on('move', (gameID, newState) => {
      setIncMove({ gameID: gameID, gameState: newState })
    })

    socket.current.on('close game', (newGameList) => {
      setCurrentGames(newGameList)
    })

    return () => { socket.current.disconnect() }
  }, [userID, username])


  const emitCreateGame = (newGameRoom) => {
    socket.current.emit('create game', userID, newGameRoom)
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

  const emitEnd = (gameID) => {
    socket.current.emit('close game', gameID)
  }

  return {
    connectedUsers,
    currentGames,
    emitCreateGame,
    emitState,
    incMove,
    userUpdate,
    emitJoin,
    emitLeave,
    emitEnd
  }
}

export default SocketHook
