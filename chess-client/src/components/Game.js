import React, { useState, useEffect, useContext } from 'react'
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
    } catch (e) { }
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

  const isMyTurn = () => {
    if (user.userID === selectedGame.hostID) {
      return selectedGame.hostColor.split("")[0] === game.turn()
    } else if (user.userID === selectedGame.playerID) {
      return selectedGame.playerColor.split("")[0] === game.turn()
    }
    console.log("not your turn")
    return false
  }

  const handleMove = (move) => {
    if (isMyTurn() && game.move(move)) {
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
    setSelectedGame({ id: null, state: null, hostID: null, playerID: null })
  }

  const endGame = () => {
    emitEnd(selectedGame.id)
    setSelectedGame({ id: null, state: null, hostID: null, playerID: null })
  }

  const imHost = () => selectedGame.hostID === user.userID

  const Opponent = () => {

    return (
      <>
        <p>
          {imHost() ? (selectedGame.playerID === null ? "No opponent connected" :
            `Guest#${selectedGame.playerID.slice(0, 4)}`)
            :
            `Guest#${selectedGame.hostID.slice(0, 4)} (host)`
          }
        </p>
      </>
    )
  }

  return (
    <div className="center-container">
      <div>
        {(selectedGame.state === null) ?
          <p>No game selected</p>
          :
          <>
            <p>{`Game#${selectedGame.id.slice(0, 4)}`}</p>
            <button onClick={() => moveRandom()}>Random move</button>
            <button onClick={() => startStop()}>
              {moving === "Start" ? "Stop" : "Start"} moving
            </button>
            <button onClick={() => reset()}>Reset</button>
            <button onClick={() => leaveGame()}>Leave game</button>
            <button onClick={() => endGame()}>End game</button>
            <br />
            <Opponent />
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
            <p>{imHost() ?
              `Guest#${selectedGame.hostID.slice(0, 4)}` :
              (selectedGame.playerID === null ? 'No opponent joined' :
                `Guest#${user.userID.slice(0, 4)}`
              )}
            </p>
            {game.game_over() ? <p>game over</p> : null}
          </>
        }
      </div>
    </div>
  )
}

export default Game;
