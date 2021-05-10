import React, { useState, useEffect, useContext } from 'react'
import Chess from 'chess.js'
import Chessboard from 'chessboardjsx'

import Context from '../context/Context'
import { fen, initialGameroom } from '../Constants'
import Player from './Player'
import GameOver from './GameOver'
import ConfirmButton from './ConfirmButton'
import Status from './Status'

const game = new Chess()

const Game = ({ selectedGame, emitState, emitLeave, emitEnd }) => {
  const { user, setSelectedGame, emitRematch, setErrorMessage } = useContext(Context)
  const [position, setPosition] = useState(fen.startingPosition)
  const [status, setStatus] = useState({})

  const isMyTurn = () => {
    if (user.id === selectedGame.host.id) {
      return selectedGame.host.color[0] === game.turn()
    } else if (user.id === selectedGame.player.id) {
      return selectedGame.player.color[0] === game.turn()
    }
    return false
  }

  const updateStatus = () => {
    return {
      player1: imPlayer() ? selectedGame.host : selectedGame.player,
      player2: imPlayer() ? selectedGame.player : selectedGame.host,
      started: (selectedGame.player.id !== null && !game.game_over()),
      isMyTurn: isMyTurn(),
      turn: game.turn(),
      over: game.game_over(),
      draw: game.in_draw(),
      in_check: game.in_check(),
      in_check_mate: game.in_checkmate()
    }
  }

  // useEffect that updates gameboard when selected game is changed
  useEffect(() => {
    try {
      game.load(selectedGame.state)
      setPosition(game.fen())
      setStatus(updateStatus())
    } catch (e) {
      setErrorMessage('Failed to load boardstate')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGame])

  const broadcastFen = fen => {
    emitState(selectedGame.id, fen, user.id)
  }

  const handleReset = (rematch) => {
    game.reset()
    setPosition(game.fen())
    broadcastFen(game.fen())
    if (rematch) emitRematch(selectedGame.id)
  }

  const handleMove = (move) => {
    if (selectedGame.player.id === null || selectedGame.host.id === null) {
      setErrorMessage('Wait for opponent or play as opponent from another window')
    }
    else if (status.isMyTurn && game.move(move)) {
      setPosition(game.fen())
      broadcastFen(game.fen())
      if (game.game_over()) {
        if (game.in_draw()) {
          emitEnd(selectedGame.id, user.id, 'draw')
        } else {
          emitEnd(selectedGame.id, user.id, 'win')
        }
      }
    }
  }

  const leaveGame = () => {
    emitLeave(user.id, selectedGame.id)
    setSelectedGame(initialGameroom)
  }

  const imPlayer = () => selectedGame.player.id === user.id
  const imHost = () => selectedGame.host.id === user.id

  const handleSurrender = () => {
    if (game.fen() === fen.startingPosition && !game.game_over()) return
    if ((imHost() || imPlayer()) && selectedGame.winner === null) {
      emitEnd(selectedGame.id, user.id, 'loss')
    }
  }

  return (
    <div className='center-container'>
      <div>
        {(selectedGame.id === null)
          ? <p>No game selected</p>
          : <>
            <p>{`Game#${selectedGame.id.slice(0, 4)}`}</p>

            {(imHost() || imPlayer())
              ? <ConfirmButton
                disable={false}
                description='Leave game?'
                buttonName='Leave game'
                acceptFunction={leaveGame} />
              : null}

            <Player player={status.player1} gameTime={selectedGame.time} />
            <Chessboard
              width={400} position={position}
              orientation={imHost() ?
                selectedGame.host.color : selectedGame.player.color}
              onDrop={(move) =>
                handleMove({
                  from: move.sourceSquare,
                  to: move.targetSquare,
                  promotion: 'q'
                })}
            />
            <Player player={status.player2} gameTime={selectedGame.time} />

            {(imHost() || imPlayer())
              ? <ConfirmButton disable={position === fen.startingPosition}
                description='Surrender?' buttonName='Surrender'
                acceptFunction={handleSurrender} />
              : null}
            <Status status={status} />
            <GameOver game={selectedGame} user={user} handleReset={handleReset} />
          </>}
      </div>
    </div>
  )
}

export default Game
