import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import Context from './context/Context'
import Game from './components/Game'
import './styles/App.css'
import GameList from './components/GameList'
import SocketHook from './service/SocketHook'

const id = uuidv4()
const user = { userID: id, username: `Guest#${id.slice(0, 4)}` }

// TODO: routing
const App = () => {
  const [selectedGame, setSelectedGame] = useState({ id: null, state: null, hostID: null, playerID: null })
  const {
    connectedUsers,
    currentGames,
    emitCreateGame,
    emitState,
    gameUpdate,
    emitJoin,
    emitLeave,
    emitEnd,
    emitClose
  } = SocketHook(user.userID, user.username)

  useEffect(() => {
    try {
      if (gameUpdate.id === selectedGame.id) {
        setSelectedGame(gameUpdate)
      }
    } catch (e) { }
  }, [gameUpdate])

  return (
    <Context.Provider value={{ user, setSelectedGame, emitCreateGame }}>
      <div className="grid-container">
        <div className="icon"></div>
        <div className="user">
          <p>logged in as {user.username}</p>
          <p>players online: {Object.keys(connectedUsers).length}</p>
        </div>

        <GameList games={currentGames} emitJoin={emitJoin} />

        <Game
          selectedGame={selectedGame}
          emitState={emitState}
          emitLeave={emitLeave}
          emitEnd={emitEnd}
          emitClose={emitClose}
        />

      </div>
    </Context.Provider>
  )
}

export default App
