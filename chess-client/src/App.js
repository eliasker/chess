import React, { useEffect, useState } from 'react'
import Chess from 'chess.js'
import { v4 as uuidv4 } from 'uuid'

import Game from './components/Game'
import './App.css'
import GameList from './components/GameList'
import SocketHook from './service/SocketHook'

const id = uuidv4()
const user = { userID: id, username: `Guest#${id.slice(0, 4)}` }

// TODO: Get gameList from server
// TODO: routing
const App = () => {
  const [gameList, setGameList] = useState({})
  const [selectedGame, setSelectedGame] = useState({ id: null, state: null })
  const {
    connectedUsers,
    currentGames,
    emitCreateGame,
    emitState,
    incMove,
    emitEnd
  } = SocketHook(user.userID, user.username)

  useEffect(() => {
    // TODO: create visual userlist component
    console.log()
  }, [connectedUsers])

  useEffect(() => {
    setGameList(currentGames)
    if (incMove.gameID === selectedGame.id) {
      setSelectedGame({ ...selectedGame, state: incMove.gameState })
    }
  }, [currentGames, incMove])

  const handleCreate = () => {
    let newGame = new Chess()
    const newGameRoom = {
      id: uuidv4(),
      p1: user, p2: null,
      state: newGame.fen()
    }

    const newGameList = gameList
    newGameList[newGameRoom.id] = newGameRoom
    setGameList(newGameList)
    emitCreateGame(newGameRoom)
    setSelectedGame(newGameRoom)
  }

  const CreateGameButton = () => {
    return (
      <div>
        <button onClick={() => handleCreate()}>create new game</button>
      </div>
    )
  }

  return (
    <div>
      <p>logged in as {user.username}</p>
      <p>players online: {Object.keys(connectedUsers).length}</p>
      <CreateGameButton />
      {Object.keys(gameList).length === 0 ?
        <p>no games at the moment</p>
        :
        <GameList games={gameList} setSelectedGame={setSelectedGame} />}

      {(selectedGame.state === null) ?
        <p>no selected</p>
        :
        <Game
          id={selectedGame.id}
          gamestate={selectedGame.state}
          emitState={emitState}
          emitEnd={emitEnd}
          setSelectedGame={setSelectedGame}
        />
      }
    </div>
  )
}

export default App
