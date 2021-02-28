import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import Context from './context/Context'
import Game from './components/Game'
import './App.css'
import GameList from './components/GameList'
import CreateGameButton from './components/CreateGameButton'
import SocketHook from './service/SocketHook'

const id = uuidv4()
const user = { userID: id, username: `Guest#${id.slice(0, 4)}` }

// TODO: routing
const App = () => {
  const [selectedGame, setSelectedGame] = useState({ id: null, state: null })
  const {
    connectedUsers,
    currentGames,
    emitCreateGame,
    emitState,
    incMove,
    emitJoin,
    emitLeave,
    emitEnd
  } = SocketHook(user.userID, user.username)

  useEffect(() => {
    if (incMove.gameID === selectedGame.id) {
      setSelectedGame({ ...selectedGame, state: incMove.gameState })
    }
  }, [currentGames, incMove])

  return (
    <Context.Provider value={{ user, setSelectedGame, emitCreateGame }}>
      <p>logged in as {user.username}</p>
      <p>players online: {Object.keys(connectedUsers).length}</p>
      <CreateGameButton />

      <GameList games={currentGames} emitJoin={emitJoin} />

      {(selectedGame.state === null) ?
        <p>No game selected</p>
        :
        <Game
          id={selectedGame.id}
          gamestate={selectedGame.state}
          emitState={emitState}
          emitLeave={emitLeave}
          emitEnd={emitEnd}
        />
      }
    </Context.Provider>
  )
}

export default App
