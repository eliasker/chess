import React from 'react'

// TODO: num of players joined
// 1/2 or 2/2, prevent joining if 2 players?
const GameList = ({ games, setSelectedGame }) => {

  const selectGame = game => {
    setSelectedGame(game)
    console.log('selecting', game.id, game.chess.fen())
  }

  return (
    <ul>
      {games.map(game =>
        <li key={game.id} onClick={() => selectGame(game)}>Game {game.id.slice(0,4)}</li>
      )}
    </ul>
  )
}

export default GameList
