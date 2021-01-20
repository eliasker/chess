import React, { useState } from 'react'
import Chess from 'chess.js'
import Chessboard from 'chessboardjsx'

let game = new Chess()

const Game = () => {
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

  // rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
  const reset = () => {
    game = new Chess()
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
      {game.game_over() ? <p>game over</p> : null}
    </div>
  )
}

export default Game;
