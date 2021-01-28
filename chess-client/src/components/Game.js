import React, { useState, useEffect } from 'react'
import Chess from 'chess.js'
import Chessboard from 'chessboardjsx'
import io from 'socket.io-client'

//TODO: socket event for closing game
const ENDPOINT = 'http://localhost:3001/'
let socket;

const Game = ({ game, p1, p2 }) => {
  const [moveInput, setMoveInput] = useState('')
  const [position, setPosition] = useState(game.fen())

  // useEffect that updates gameboard when selected game is changed 
  useEffect(() => { setPosition(game.fen()) }, [game])

  /*
  useEffect(() => {
    socket = io(ENDPOINT)
    socket.emit('join', () => console.log(socket.id))
  }, [])

  useEffect(() => {
    socket.on('move', (fen) => {
      console.log('incoming move', fen)
      game.load(fen)
      setPosition(game.fen())
    })
  }, [])
*/
  const broadcastFen = fen => {
    console.log('broadcasting ', fen)
    //socket.emit('move', fen)
  }

  const moveRandom = () => {
    if (!game.game_over()) {
      const moves = game.moves()
      const move = moves[Math.floor(Math.random() * moves.length)]
      game.move(move)
      setPosition(game.fen())
      console.log('moverandom', move)

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

  return (
    <div className="center-container">
      <div className="center-horizontal">

        <button onClick={() => moveRandom()}>Random move</button>
        <button onClick={() => reset()}>Reset</button>
        <button onClick={() => listMoves()}>List moves</button>
        <form onSubmit={e => playSelectedMove(e)}>
          <p>Enter: move</p>
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
