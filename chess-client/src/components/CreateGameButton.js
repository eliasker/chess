import React, { useContext } from 'react'
import Context from '../context/Context'
import { v4 as uuidv4 } from 'uuid'

import { fen } from '../Constants'

const CreateGameButton = () => {
  const {
    user,
    setSelectedGame,
    emitCreateGame
  } = useContext(Context)

  const handleCreate = () => {
    const color = Math.random() > 0.5 ? "white" : "black"

    const newGameRoom = {
      hostID: user.userID,
      hostColor: color,
      playerColor: color === "white" ? "black" : "white",
      playerID: null,
      connections: [],
      id: uuidv4(),
      state: fen.startingPosition
    }

    emitCreateGame(newGameRoom)
    setSelectedGame(newGameRoom)
  }

  return (
    <div className="create-game" >
      <button onClick={() => handleCreate()}>Create game</button>
    </div>
  )
}

export default CreateGameButton
