import React, { useState, useEffect, useContext } from 'react'
import Chess from 'chess.js'
import Chessboard from 'chessboardjsx'

import Context from '../context/Context'
import { initialGameroom } from '../Constants'
let game = new Chess()

const Game = ({ selectedGame, emitState, emitLeave, emitEnd, emitClose }) => {
  const { user, setSelectedGame } = useContext(Context)
  const [position, setPosition] = useState(null)
  const [moving, setMoving] = useState("Stop")

  // useEffect that updates gameboard when selected game is changed 
  useEffect(() => {
    try {
      game.load(selectedGame.state)
      if (game.game_over()) {
        console.log('over', game.game_over(), 'mate', game.in_checkmate())
      }
      setPosition(game.fen())
    } catch (e) { }
  }, [selectedGame])

  // Dev utility for making random moves 
  useEffect(() => {
    const interval = setInterval(() => {
      if (moving === "Start") moveRandom()
    }, 300)
    return () => clearInterval(interval)
  }, [moving])

  const broadcastFen = fen => {
    emitState(selectedGame.id, fen)
  }

  // Dev function that makes a random move on board (ignoring turn player checking)
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
    if (user.userID === selectedGame.host.id) {
      return selectedGame.host.color.split("")[0] === game.turn()
    } else if (user.userID === selectedGame.player.id) {
      return selectedGame.player.color.split("")[0] === game.turn()
    }
    return false
  }

  const handleMove = (move) => {
    if (isMyTurn() && game.move(move)) {
      setPosition(game.fen())
      broadcastFen(game.fen())
      if (game.game_over()) {
        if (game.in_draw()) {
          emitEnd(selectedGame.id, user.userID, false)
        } else {
          emitEnd(selectedGame.id, user.userID, true)
        }
      }
    }
  }

  const startStop = () => {
    if (moving === "Start") setMoving("Stop")
    else setMoving("Start")
  }

  const leaveGame = () => {
    emitLeave(user.userID, selectedGame.id)
    setSelectedGame(initialGameroom)
  }

  const closeGame = () => {
    emitClose(selectedGame.id)
    setSelectedGame(initialGameroom)
  }

  const imHost = () => selectedGame.host.id === user.userID

  const Opponent = () => {

    return (
      <>
        <p>
          {imHost() ? (selectedGame.player.id === null ? "No opponent connected" :
            `Guest#${selectedGame.player.id.slice(0, 4)}`)
            :
            `Guest#${selectedGame.host.id.slice(0, 4)} (host)`
          }
        </p>
      </>
    )
  }

  const testCheckmate = () => {
    game.load("6k1/5ppp/p7/P7/5b2/7P/1r3PP1/3R2K1 w - - 0 1")
    setPosition(game.fen())
    broadcastFen(game.fen())
  }

  return (
    <div className="center-container">
      <div>
        {(selectedGame.id === null) ?
          <p>No game selected</p>
          :
          <>
            <p>{`Game#${selectedGame.id.slice(0, 4)}`}</p>
            <button onClick={() => moveRandom()}>Random move</button>
            <button onClick={() => startStop()}>
              {moving === "Start" ? "Stop" : "Start"} moving
            </button>
            <button onClick={() => reset()}>Reset</button>
            <button onClick={() => testCheckmate()}>1 move checkmate</button>
            <button onClick={() => leaveGame()}>Leave game</button>
            <button onClick={() => closeGame()}>Close game</button>
            <br />
            <Opponent />
            <Chessboard
              width={400} position={position}
              orientation={selectedGame.host.id === user.userID ?
                selectedGame.host.color : selectedGame.player.color}
              onDrop={(move) =>
                handleMove({
                  from: move.sourceSquare,
                  to: move.targetSquare,
                  promotion: 'q'
                })
              }
            />
            <p>{imHost() ?
              `Guest#${selectedGame.host.id.slice(0, 4)}` :
              (selectedGame.player.id === null ? 'No opponent joined' :
                `Guest#${selectedGame.player.id.slice(0, 4)}`
              )}
            </p>
            {game.game_over() ? <p>Game over</p> : null}
          </>
        }
      </div>
    </div>
  )
}

export default Game;
