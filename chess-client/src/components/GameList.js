import React from 'react'

// TODO: num of players joined
// 1/2 or 2/2, prevent joining if 2 players?
const GameList = ({ games, setSelectedGame }) => {
  const selectGame = game => {
    setSelectedGame(game)
    console.log('selecting', game.id)
  }
  return (
    <ul>
      {Object.keys(games).map((key) =>
        <li
          key={games[key].id}
          onClick={() => selectGame(games[key])}>
          Game {games[key].id.slice(0, 4)}

        </li>
      )}
    </ul>
  )
}

export default GameList
