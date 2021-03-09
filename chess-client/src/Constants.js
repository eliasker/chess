export const fen = {
  startingPosition: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
}

export const initialPlayer = {
  time: 0,
  score: 0,
  id: null,
  color: ""
}

export const initialGameroom = {
  id: null,
  state: fen.startingPosition,
  host: initialPlayer,
  player: initialPlayer
}
