import React, { useState, useEffect, useContext, useRef } from 'react'
import Chess from 'chess.js'
import Chessboard from 'chessboardjsx'

import Context from '../context/Context'

let game = new Chess()

const Game = ({ selectedGame, emitState, emitLeave, emitEnd }) => {
  const { user, setSelectedGame } = useContext(Context)
  const [position, setPosition] = useState(null)
  const [moving, setMoving] = useState("Stop")

  // useEffect that updates gameboard when selected game is changed 
  useEffect(() => {
    try {
      game.load(selectedGame.state)
      setPosition(game.fen())
    } catch (e) { console.log(e) }
  }, [selectedGame])

  useEffect(() => {
    const interval = setInterval(() => {
      if (moving === "Start") moveRandom()
    }, 3000)
    return () => clearInterval(interval)
  }, [moving])

  const broadcastFen = fen => {
    emitState(selectedGame.id, fen)
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

  const handleMove = (move) => {
    if (game.move(move)) {
      setPosition(game.fen())
      broadcastFen(game.fen())
    }
  }

  const startStop = () => {
    if (moving === "Start") setMoving("Stop")
    else setMoving("Start")
  }

  const leaveGame = () => {
    emitLeave(user.userID, selectedGame.id)
    setSelectedGame({ id: null, state: null })
  }

  const endGame = () => {
    emitEnd(selectedGame.id)
    setSelectedGame({ id: null, state: null })
  }

  return (
    <div className="center-container">
      <div className="center-horizontal">

        <button onClick={() => moveRandom()}>Random move</button>
        <button onClick={() => startStop()}>{moving === "Start" ? "Stop" : "Start"} moving</button>
        <button onClick={() => reset()}>Reset</button>
        <button onClick={() => leaveGame()}>Leave game</button>
        <button onClick={() => endGame()}>End game</button>
        <br />
        <p>{selectedGame.playerID === null ?
          "No opponent connected" :
          `Guest#${selectedGame.playerID.slice(0, 4)}`}
        </p>
        <Chessboard
          width={400} position={position}
          orientation={selectedGame.hostID === user.userID ?
            selectedGame.hostColor : selectedGame.playerColor}
          onDrop={(move) =>
            handleMove({
              from: move.sourceSquare,
              to: move.targetSquare,
              promotion: 'q'
            })
          }
        />
        <p>{`Guest#${selectedGame.hostID.slice(0, 4)}`}</p>
        {game.game_over() ? <p>game over</p> : null}
      </div>
    </div>
  )
}

export default Game;
