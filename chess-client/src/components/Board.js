import React, { useState } from 'react'
import Chess from 'chess.js'

let chess = new Chess()

const Board = () => {
  const [moveInput, setMoveInput] = useState("")


  const playMove = () => {
    if (!chess.game_over()) {
      const moves = chess.moves()
      const move = moves[Math.floor(Math.random() * moves.length)]
      chess.move(move)
      console.log(chess.ascii())
    }
  }

  const reset = () => chess = new Chess()
  const listMoves = () => console.log(chess.moves())

  const playSelectedMove = event => {
    event.preventDefault()
    chess.move(moveInput)
    setMoveInput("")
    console.log(chess.ascii())
  }

  return (
    <div>
      <button onClick={() => playMove()}>Random move</button>
      <button onClick={() => reset()}>Reset</button>
      <button onClick={() => listMoves()}>List moves</button>
      <form onSubmit={e => playSelectedMove(e)}>
        <p>Enter: move</p>
        <input value={moveInput} onChange={e => setMoveInput(e.target.value)} type="text" />
        <input type="submit" />
      </form>
    </div>
  )
}

export default Board;
