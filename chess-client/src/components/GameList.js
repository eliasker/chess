import React, { useContext } from 'react'

import Context from '../context/Context'
import CreateGame from './CreateGame'

// TODO: num of players joined and spectating
// if those are not null allow only joining as spectator
const GameList = ({ selectedID, games, emitJoin }) => {
  const { user, setSelectedGame } = useContext(Context)

  const spectate = (gameID) => {
    if (games[gameID].host.id !== user.userID) {
      emitJoin(user, gameID, false)
    }
    setSelectedGame(games[gameID])
  }

  const join = (gameID) => {
    if (games[gameID].player.id === null) {
      emitJoin(user, gameID, true)
    }
    setSelectedGame(games[gameID])
  }

  return (
    <div className='game-list'>
      <CreateGame />
      {Object.keys(games).length === 0
        ? <p className='center-text'>No ongoing games</p>
        : <ul>
          {Object.keys(games).map((gameID) =>
            <li
              key={gameID}
              className={`${gameID === selectedID ? 'highlight clickable' : 'clickable'}`}
              onClick={() => spectate(gameID)}
            >
              Game#{gameID.slice(0, 4)}
              <>
                {(games[gameID].host.id !== user.userID && games[gameID].player.id === null)
                  ? <button onClick={() => join(gameID)}>Join</button> : null}
              </>
            </li>
          )}
        </ul>}
    </div>
  )
}

export default GameList
