import React, { useState } from 'react'
import Chess from 'chess.js'

import Game from './components/Game'
import './App.css'
import GameList from './components/GameList'

const user = { userID: "0", username: "Guest#0" }

// TODO: Get gameList from server
// TODO: routing
const App = () => {
  const [gameList, setGameList] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)

  const handleCreate = () => {
    // TODO: socket event new game
    let newGame = new Chess()
    const newGameRoom = { id: gameList.length + 1, p1: user, p2: null, chess: newGame }
    setGameList([...gameList, newGameRoom])
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
      <CreateGameButton />
      {gameList.length === 0 ?
        <p>no games at the moment</p>
        :
        <GameList games={gameList} setSelectedGame={setSelectedGame} />}

      {selectedGame === null ?
        null
        :
        <Game game={selectedGame.chess} p1={selectedGame.p1} p2={selectedGame.p2} />}
    </div>
  )
}

export default App
