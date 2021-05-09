import React from 'react'

const GameOver = ({ game, user, handleReset }) => {
  const gameoverText = `Game over: ${game.winner === 'draw' ? 'draw'
    : (game.winner === user.name ? 'You won' : 'You lost')}`
  return (
    <>{game.winner === null ? null
      : <>
        <p>{gameoverText}</p>
        <button onClick={() => handleReset(true)}>Rematch</button>
        </>}
    </>
  )
}

export default GameOver
