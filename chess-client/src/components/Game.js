import React, { useState, useEffect, useContext } from 'react'
import Chess from 'chess.js'
import Chessboard from 'chessboardjsx'

import Context from '../context/Context'
import { initialGameroom } from '../Constants'
import Player from './Player'
let game = new Chess()

const Game = ({ selectedGame, emitState, emitLeave, emitEnd, emitClose }) => {
  const { user, setSelectedGame } = useContext(Context)
  const [position, setPosition] = useState(null)
  const [moving, setMoving] = useState("Stop")
  const [gameOver, setGameOver] = useState("")

  const isMyTurn = () => {
    if (user.userID === selectedGame.host.id) {
      return selectedGame.host.color.split("")[0] === game.turn()
    } else if (user.userID === selectedGame.player.id) {
      return selectedGame.player.color.split("")[0] === game.turn()
    }
    return false
  }

  // useEffect that updates gameboard when selected game is changed 
  useEffect(() => {
    try {
      game.load(selectedGame.state)
      if (game.game_over()) {
        if (game.in_draw()) {
          setGameOver("Game over: Draw")
        } else if (game.in_checkmate()) {
          if (isMyTurn()) {
            setGameOver("Game over: You lost")
          } else if (user.userID === selectedGame.host.id || user.userID === selectedGame.player.id) {
            setGameOver("Game over: You won")
          } else {
            setGameOver("Game over")
          }
        }
      } else (setGameOver(""))
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

  const imPlayer = () => selectedGame.player.id === user.userID

  const testCheckmate = () => {
    game.load("6k1/5ppp/p7/P7/5b2/7P/1r3PP1/3R2K1 w - - 0 1")
    setPosition(game.fen())
    broadcastFen(game.fen())
  }

  const testDraw = () => {
    game.load("8/8/5k2/3K4/8/8/8/8 w - - 0 1")
    setPosition(game.fen())
    broadcastFen(game.fen())
  }

  const Buttons = () => {
    return (
      <>
        <button onClick={() => moveRandom()}>Random move</button>
        <button onClick={() => startStop()}>
          {moving === "Start" ? "Stop" : "Start"} moving
            </button>
        <button onClick={() => reset()}>Reset</button>
        <button onClick={() => testCheckmate()}>1 move checkmate</button>
        <button onClick={() => testDraw()}>Draw</button>
        <button onClick={() => leaveGame()}>Leave game</button>
        <button onClick={() => closeGame()}>Close game</button>
        <br />
      </>
    )
  }

  return (
    <div className="center-container">
      <div>
        {(selectedGame.id === null) ?
          <p>No game selected</p>
          :
          <>
            <p>{`Game#${selectedGame.id.slice(0, 4)}`}</p>
            <Buttons />

            {imPlayer() ?
              <>
                <Player id={selectedGame.host.id} score={selectedGame.host.score} />
                <Chessboard
                  width={400} position={position}
                  orientation={selectedGame.player.color}
                  onDrop={(move) =>
                    handleMove({
                      from: move.sourceSquare,
                      to: move.targetSquare,
                      promotion: 'q'
                    })
                  }
                />
                <Player id={selectedGame.player.id} score={selectedGame.player.score} />
              </>
              :
              <>
                <Player id={selectedGame.player.id} score={selectedGame.player.score} />
                <Chessboard
                  width={400} position={position}
                  orientation={selectedGame.host.color}
                  onDrop={(move) =>
                    handleMove({
                      from: move.sourceSquare,
                      to: move.targetSquare,
                      promotion: 'q'
                    })
                  }
                />
                <Player id={selectedGame.host.id} score={selectedGame.host.score} />
              </>
            }
            {gameOver === "" ? null : <p>{gameOver}</p>}
          </>
        }
      </div>
    </div>
  )
}

export default Game;
