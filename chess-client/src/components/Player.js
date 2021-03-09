import React from 'react'

const Player = ({ id, score }) => {
  return (
    <div className="opposite-container">
      {id === null ? <p>No opponent connected</p> : <p>Guest#{id.slice(0, 4)}</p>}
      <p>Score: {score}</p>
    </div>
  )
}

export default Player
