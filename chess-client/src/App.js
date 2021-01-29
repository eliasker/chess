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
  //setGameList(gameList.set(newGameID, newGameObject))
  const [gameList, setGameList] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)
  const { connectedUsers, currentGames } = SocketHook(user.userID, user.username)

  useEffect(() => {
    console.log(connectedUsers)
  }, [connectedUsers])

  useEffect(() => {
    setGameList(currentGames)
  }, [currentGames])

  const handleCreate = () => {
    // TODO: socket event new game
    let newGame = new Chess()
    const newGameRoom = {
      id: uuidv4(),
      p1: user, p2: null,
      chess: newGame
    }
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
