import React, { useState, useEffect } from 'react'
import Chess from 'chess.js'
import Chessboard from 'chessboardjsx'

let game = new Chess()

const Game = ({ id, gamestate, emitState, emitEnd, setSelectedGame }) => {
  const [moveInput, setMoveInput] = useState('')
  const [position, setPosition] = useState(null)
  const [moving, setMoving] = useState("Stop")

  // useEffect that updates gameboard when selected game is changed 
  useEffect(() => {
    try {
      console.log('change to ', gamestate)
      game.load(gamestate)
      setPosition(game.fen())
    } catch (e) { console.log(e) }
  }, [gamestate])

  useEffect(() => {
    const interval = setInterval(() => {
      if (moving === "Start") moveRandom()
    }, 3000)
    return () => clearInterval(interval)
  }, [moving])

  const broadcastFen = fen => {
    emitState(id, fen)
  }

  const moveRandom = () => {
    if (!game.game_over()) {
      const moves = game.moves()
      const move = moves[Math.floor(Math.random() * moves.length)]
      game.move(move)
      setPosition(game.fen())
      broadcastFen(game.fen())
    }
  }

  const reset = () => {
    game.reset()
    setPosition(game.fen())
    broadcastFen(game.fen())
  }

  const listMoves = () => console.log(game.moves())

  const playSelectedMove = event => {
    console.log('playselectedmove', moveInput)
    event.preventDefault()
    game.move(moveInput)
    setPosition(game.fen())
    setMoveInput('')
    broadcastFen(game.fen())
  }

  const handleMove = (move) => {
    console.log('handlemove', move)
    if (game.move(move)) {
      setPosition(game.fen())
      broadcastFen(game.fen())
    }
  }

  const startStop = () => {
    if (moving === "Start") setMoving("Stop")
    else setMoving("Start")
  }

  const endGame = () => {
    emitEnd(id)
    setSelectedGame({ id: null, state: null })
  }

  return (
    <div className="center-container">
      <div className="center-horizontal">

        <button onClick={() => moveRandom()}>Random move</button>
        <button onClick={() => startStop()}>{moving === "Start" ? "Stop" : "Start"} moving</button>
        <button onClick={() => reset()}>Reset</button>
        <button onClick={() => listMoves()}>List moves</button>
        <button onClick={() => endGame()}>End game</button>
        <form onSubmit={e => playSelectedMove(e)}>
          <p>Enter move</p>
          <input value={moveInput} onChange={e => setMoveInput(e.target.value)} type="text" />
          <input type="submit" />
        </form>
        <br />
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
        {game.game_over() ? <p>game over</p> : null}
      </div>
    </div>
  )
}

export default Game;
