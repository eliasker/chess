import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import Context from './context/Context'
import User from './components/user/User'
import Game from './components/Game'
import './styles/App.css'
import GameList from './components/GameList'
import SocketHook from './service/SocketHook'
import { initialGameroom } from './Constants'
import ErrorMessage from './components/ErrorMessage'

const id = uuidv4()
const initUser = { id: id, guest: true, name: `Guest#${id.slice(0, 4)}` }

const App = () => {
  const [user, setUser] = useState(initUser)
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
  } = SocketHook(user.id, user.name, setErrorMessage)

  useEffect(() => {
    try {
      if (gameUpdate.id === selectedGame.id) {
        setSelectedGame(gameUpdate)
      }
    } catch (e) { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameUpdate])

  // TODO: navbar component
  return (
    <Context.Provider value={{ user, setUser, setSelectedGame, emitCreateGame, emitRematch, setErrorMessage }}>
      <div className='grid-container'>
        <div className='icon' />
        <div className='user'>
          <User />
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
