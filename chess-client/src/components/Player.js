import React from 'react'

import Timer from './Timer'

const Player = ({ player, gameStarted, timerOn }) => {
  return (
    <div className='opposite-container'>
      {player.id === null ? <p>No opponent connected</p> : <p>Guest#{player.id.slice(0, 4)}</p>}
      
      <Timer milliseconds={player.time} gameStarted={gameStarted} timerOn={timerOn} />
      
      <p>Score: {player.score}</p>
    </div>
  )
}

export default Player
