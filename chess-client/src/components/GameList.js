import React, { useContext } from 'react'

import Context from '../context/Context'

// TODO: num of players joined and spectating
// 1/2 or 2/2, prevent joining if 2 players?
// Yes: game has host and a player. 
// if those are not null allow only joining as spectator
const GameList = ({ games, emitJoin }) => {
  const { user, setSelectedGame } = useContext(Context)

  const spectate = (gameID) => {
    emitJoin(user.userID, gameID, false)
    setSelectedGame(games[gameID])
  }

  const join = (gameID) => {
    emitJoin(user.userID, gameID, true)
    setSelectedGame(games[gameID])
  }

  return (
    <>
      {Object.keys(games).length === 0 ?
        <p>No ongoing games</p> :
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
        </ul>}
    </>
  )
}

export default GameList
