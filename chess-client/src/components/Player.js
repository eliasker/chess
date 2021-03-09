import React from 'react'

const Player = ({ id, score }) => {
  return (
    <>
      {id === null ? <p>No opponent connected</p> : <p>Guest#{id.slice(0,4)}</p>}
      <p>Score: {score}</p>
    </>
  )
}

export default Player
