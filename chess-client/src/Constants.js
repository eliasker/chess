export const fen = {
  startingPosition: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
}

export const initialPlayer = {
  time: 0,
  score: 0,
  id: null,
  username: null,
  color: ''
}

export const initialGameroom = {
  id: null,
  state: fen.startingPosition,
  winner: null,
  host: initialPlayer,
  player: initialPlayer,
  turn: 'w',
  connections: [],
  time: null,
  increment: null
}
