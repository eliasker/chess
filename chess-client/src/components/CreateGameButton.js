import React, { useContext } from 'react'
import Context from '../context/Context'
import { v4 as uuidv4 } from 'uuid'

import { initialPlayer, initialGameroom } from '../Constants'

const CreateGameButton = () => {
  const {
    user,
    setSelectedGame,
    emitCreateGame
  } = useContext(Context)

  const handleCreate = () => {
    const randomColor = Math.random() > 0.5 ? 'white' : 'black'

    const newHost = { ...initialPlayer, id: user.userID, username: user.username, color: randomColor }
    const newGameRoom = { ...initialGameroom, id: uuidv4(), host: newHost }

    emitCreateGame(newGameRoom)
    setSelectedGame(newGameRoom)
  }

  return (
    <div className='create-game'>
      <button onClick={() => handleCreate()}>Create game</button>
    </div>
  )
}

export default CreateGameButton
