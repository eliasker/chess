import React, { useContext } from 'react'

import Context from '../context/Context'
import CreateGame from './CreateGame'

// TODO: num of players joined and spectating
// if those are not null allow only joining as spectator
const GameList = ({ selectedID, games, emitJoin }) => {
  const { user, setSelectedGame } = useContext(Context)

  const spectate = (game) => {
    if (game.host.id !== user.id) {
      emitJoin(user, game.id, false)
    }
    setSelectedGame(game)
  }

  const join = (game) => {
    if (game.player.id === null) {
      emitJoin(user, game.id, true)
    }
    setSelectedGame(game)
  }

  return (
    <div className='game-list'>
      <CreateGame />
      {games.length === 0
        ? <p className='center-text'>No ongoing games</p>
        : <ul>
          {games.map((game) =>
            <li
              key={game.id}
              className={`${game.id === selectedID ? 'highlight clickable' : 'clickable'}`}
              onClick={() => spectate(game)}
            >
              Game#{game.id.slice(0, 4)}
              <>
                {(game.host.id !== user.id && game.player.id === null)
                  ? <button onClick={() => join(game)}>Join</button> : null}
              </>
            </li>
          )}
        </ul>}
    </div>
  )
}

export default GameList
