import React from 'react'

const GameStatus = ({ status }) => {
  const turn = status.isMyTurn ? 'Your turn' :
    (status.turn === 'w' ? 'Turn: white' : 'Turn: black')
  const check = status.in_check ? ', in check' : null
  return (
    <>
      <p>{turn}{check}</p>
    </>
  )
}

export default GameStatus
