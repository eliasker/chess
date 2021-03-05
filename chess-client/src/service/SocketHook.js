import { useRef, useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client'

const ENDPOINT = 'http://localhost:3001/'

// TODO: const leaveRoom = () => {}

const SocketHook = (userID, username) => {
  const [connectedUsers, setConnectedUsers] = useState([])
  const [currentGames, setCurrentGames] = useState([])
  const [incMove, setIncMove] = useState({ gameID: null, gameState: null })
  const [userUpdate, setUserUpdate] = useState({ gameID: null, playerID: null })
  const socket = useRef()

  useEffect(() => {
    socket.current = socketIOClient(ENDPOINT)
    socket.current.emit('join server', { userID: userID, username: username })

    // users are mapped newUserList[socket.id] = user
    socket.current.on('update users', newUserList => {
      setConnectedUsers(newUserList)
    })

    socket.current.on('update games', (newGameList) => {
      setCurrentGames(newGameList)
    })

    socket.current.on('player event', (gameID, userID) => {
      console.log('player event')
      setUserUpdate({ gameID: gameID, playerID: userID })
    })

    // TODO: not actually used
    socket.current.on('move', (gameID, newState) => {
      console.log('move event')
      setIncMove({ gameID: gameID, gameState: newState })
    })

    /*
    socket.current.on('join', (userID, gameID, isPlayer) => {
      const updatedGames = currentGames
      updatedGames
    })*/

    socket.current.on('close game', (newGameList) => {
      setCurrentGames(newGameList)
    })

    return () => { socket.current.disconnect() }
  }, [userID, username])


  const emitCreateGame = (user, newGameRoom) => {
    socket.current.emit('create game', user, newGameRoom)
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
