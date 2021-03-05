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
    incMove,
    userUpdate,
    emitJoin,
    emitLeave,
    emitEnd
  } = SocketHook(user.userID, user.username)

  useEffect(() => {
    if (incMove.gameID === selectedGame.id) {
      setSelectedGame({ ...selectedGame, state: incMove.gameState })
    }
  }, [currentGames, incMove])

  useEffect(() => {
    if (userUpdate.gameID === selectedGame.id) {
      setSelectedGame({ ...selectedGame, playerID: userUpdate.playerID })
    }
  }, [userUpdate])

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
        />

      </div>
    </Context.Provider>
  )
}

export default App
