import React from 'react'

const msToTimeStr = (milliseconds) => {
  const minutes = Math.floor((milliseconds) / 60000)
  const seconds = (((milliseconds) % 60000) / 1000).toFixed(0)
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`
  const secStr = seconds < 10 ? `0${seconds}` : `${seconds}`
  return `${minStr}:${secStr}`
}

const Player = ({ player, gameTime }) => {
  return (
    <div className='opposite-container'>
      {player.id === null ?
        <p>No opponent connected</p> :
        <p>Guest#{player.id.slice(0, 4)}</p>
      }
      {gameTime === null ? null : <p>{msToTimeStr(player.time)}</p>}
      <p>Score: {player.score}</p>
    </div>
  )
}

export default Player
