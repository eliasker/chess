import React from 'react'

// TODO: num of players joined and spectating
// 1/2 or 2/2, prevent joining if 2 players?
// Yes: game has host and a player. 
// if those are not null allow only joining as spectator
const GameList = ({ userID, games, setSelectedGame, emitJoin }) => {
  const spectate = (gameID) => {
    emitJoin(userID, gameID, false)
    setSelectedGame(games[gameID])
  }

  const join = (gameID) => {
    emitJoin(userID, gameID, true)
    setSelectedGame(games[gameID])
  }

  return (
    <ul>
      {Object.keys(games).map((gameID) =>
        <li
          key={gameID}
          onClick={() => setSelectedGame(games[gameID])}
        >
          Game {gameID.slice(0, 4)}
          <>
            <button onClick={() => join(gameID)}>Join</button>
            <button onClick={() => spectate(gameID)}>Spectate</button>
          </>
        </li>
      )}
    </ul>
  )
}

export default GameList
