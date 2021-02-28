import React, { useContext } from 'react'
import Context from '../context/Context'
import { v4 as uuidv4 } from 'uuid'

import fen from '../Constants'

const CreateGameButton = () => {
  const {
    user,
    setSelectedGame,
    emitCreateGame
  } = useContext(Context)

  const handleCreate = () => {
    const newGameRoom = {
      hostID: user.userID,
      playerID: null,
      connections: [],
      id: uuidv4(),
      state: fen.startingPosition
    }

    emitCreateGame(newGameRoom)
    setSelectedGame(newGameRoom)
  }

  return (
    <button onClick={() => handleCreate()}>Create game</button>
  )
}

export default CreateGameButton
