import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import Context from './context/Context'
import Game from './components/Game'
import './styles/App.css'
import GameList from './components/GameList'
import SocketHook from './service/SocketHook'
import { initialGameroom } from './Constants'
import ErrorMessage from './components/ErrorMessage'
const id = uuidv4()
const user = { userID: id, username: `Guest#${id.slice(0, 4)}` }

const App = () => {
  const [selectedGame, setSelectedGame] = useState(initialGameroom)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    connectedUsers,
    currentGames,
    emitCreateGame,
    emitState,
    gameUpdate,
    emitJoin,
    emitRematch,
    emitLeave,
    emitEnd
  } = SocketHook(user.userID, user.username, setErrorMessage)

  useEffect(() => {
    try {
      if (gameUpdate.id === selectedGame.id) {
        setSelectedGame(gameUpdate)
      }
    } catch (e) { }
  }, [gameUpdate])

  return (
    <Context.Provider value={{ user, setSelectedGame, emitCreateGame, emitRematch, setErrorMessage }}>
      <div className='grid-container'>
        <div className='icon' />
        <div className='user'>
          <p>logged in as {user.username}</p>
          <p>players online: {Object.keys(connectedUsers).length}</p>
        </div>

        <GameList selectedID={selectedGame.id} games={currentGames} emitJoin={emitJoin} />

        <Game
          selectedGame={selectedGame}
          emitState={emitState}
          emitLeave={emitLeave}
          emitEnd={emitEnd}
        />
        <ErrorMessage errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
      </div>
    </Context.Provider>
  )
}

export default App
