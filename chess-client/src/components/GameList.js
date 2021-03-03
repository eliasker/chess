import React, { useContext } from 'react'

import Context from '../context/Context'
import CreateGameButton from './CreateGameButton'

// TODO: num of players joined and spectating
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
    <div className="game-list">
      <CreateGameButton />
      {Object.keys(games).length === 0 ?
        <p>No ongoing games</p> :
        <ul>
          {Object.keys(games).map((gameID) =>
            <li
              key={gameID}
              className="clickable"
              onClick={() => spectate(gameID)}
            >
              Game#{gameID.slice(0, 4)}
              <>
                {(games[gameID].hostID !== user.userID && games[gameID].playerID === null) ?
                  <button onClick={() => join(gameID)}>Join</button> : null}
              </>
            </li>
          )}
        </ul>}
    </div>
  )
}

export default GameList
