import React, { useState } from 'react'
import Chess from 'chess.js'
import Chessboard from 'chessboardjsx'

const Board = () => {
  const [game, setGame] = useState(new Chess())
  const [moveInput, setMoveInput] = useState('')
  const [position, setPosition] = useState(game.fen())

  const moveRandom = () => {
    if (!game.game_over()) {
      const moves = game.moves()
      const move = moves[Math.floor(Math.random() * moves.length)]
      game.move(move)
      setPosition(game.fen())
    }
  }

  const reset = () => {
    setGame(new Chess())
    setPosition(game.fen())
  }
  const listMoves = () => console.log(game.moves())

  const playSelectedMove = event => {
    event.preventDefault()
    game.move(moveInput)
    setPosition(game.fen())
    setMoveInput('')
  }

  const handleMove = (move) => {
    if (game.move(move)) {
      setPosition(game.fen())
    }
  }

  return (
    <div>
      <button onClick={() => moveRandom()}>Random move</button>
      <button onClick={() => reset()}>Reset</button>
      <button onClick={() => listMoves()}>List moves</button>
      <form onSubmit={e => playSelectedMove(e)}>
        <p>Enter: move</p>
        <input value={moveInput} onChange={e => setMoveInput(e.target.value)} type="text" />
        <input type="submit" />
      </form>

      <div>
        <Chessboard
          width={400} position={position}
          onDrop={(move) =>
            handleMove({
              from: move.sourceSquare,
              to: move.targetSquare,
              promotion: 'q'
            })
          }
        />
      </div>

    </div>
  )
}

export default Board;
