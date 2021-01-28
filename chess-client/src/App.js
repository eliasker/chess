import React, { useState } from 'react'
import Chess from 'chess.js'

import Game from './components/Game'
import './App.css'

const user = { userID: "0", username: "Guest#0" }

// TODO: Get gameList from server
// TODO: routing
const App = () => {
  const [gameList, setGameList] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)

  const selectGame = game => {
    setSelectedGame(game)
    console.log('selecting', game.id, game.chess.fen())
  }

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

  // TODO: separate component 
  // TODO: num of players joined
  // 1/2 or 2/2, prevent joining if 2 players?
  const listGames = () => {
    console.log(gameList)
    return (
      <ul>
        {gameList.map(game =>
          <li key={game.id} onClick={() => selectGame(game)}>Game {game.id}</li>
        )}
      </ul>
    )
  }

  return (
    <div>
      <CreateGameButton />
      {gameList.length === 0 ?
        <p>no games at the moment</p> : listGames()}
      {selectedGame === null ?
        null : <Game game={selectedGame.chess} p1={selectedGame.p1} p2={selectedGame.p2} />}
    </div>
  )
}

export default App
