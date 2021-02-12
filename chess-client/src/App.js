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
  const [selectedGame, setSelectedGame] = useState(null)
  const {
    connectedUsers,
    currentGames,
    emitCreateGame
  } = SocketHook(user.userID, user.username)

  useEffect(() => {
    // TODO: create visual userlist component
    console.log('users', connectedUsers)
  }, [connectedUsers])

  useEffect(() => {
    setGameList(currentGames)
    console.log('games', currentGames)
  }, [currentGames])

  const handleCreate = () => {
    // TODO: socket event new game
    let newGame = new Chess()
    const newGameRoom = {
      id: uuidv4(),
      p1: user, p2: null,
      chess: newGame
    }
    //setGameList([...gameList, newGameRoom])
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
      <CreateGameButton />
      {Object.keys(gameList).length === 0 ?
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
