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
  const [incMove, setIncMove] = useState({ gameID: null, gameState: null })
  const socket = useRef()

  useEffect(() => {
    socket.current = socketIOClient(ENDPOINT)
    socket.current.emit('join server', { userID: userID, username: username })

    socket.current.on('update users', newUserList => {
      setConnectedUsers(newUserList)
      //console.log('users', newUserList)
    })

    socket.current.on('update games', (newGameList, gameID, newState) => {
      setCurrentGames(newGameList)
      setIncMove({ gameID: gameID, gameState: newState })
      //console.log('update received', newGameList)
    })

    socket.current.on('move', (gameID, newState) => {
      const updatedGames = currentGames
      updatedGames[gameID].state = newState
      setCurrentGames(updatedGames)
    })

    socket.current.on('close game', (newGameList) => {
      setCurrentGames(newGameList)
    })

    return () => { socket.current.disconnect(userID) }
  }, [userID, username])


  const emitCreateGame = (newGameRoom) => {
    //console.log('emit create game', newGameRoom)
    socket.current.emit('create game', newGameRoom)
  }

  const emitState = (gameID, newState) => {
    socket.current.emit('move', gameID, newState)
  }

  const emitEnd = (gameID) => {
    socket.current.emit('close game', gameID)
  }

  return { connectedUsers, currentGames, emitCreateGame, emitState, incMove, emitEnd }

}

export default SocketHook
