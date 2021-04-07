import React from 'react'

const Player = ({ player }) => {
  return (
    <div className='opposite-container'>
      {player.id === null ? <p>No opponent connected</p> : <p>Guest#{player.id.slice(0, 4)}</p>}
      <p>Score: {player.score}</p>
    </div>
  )
}

export default Player
