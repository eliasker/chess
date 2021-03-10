const { Chess } = require('chess.js')

/**
 * Testing that chess.js behaves expectedly in following situations:
 * Checkmate
 * En passant
 * Stalemate --> draw
 * Threefold repetition --> draw
 * Insufficient material --> draw
 */

describe('Checkmate: Black loses when white rook moves to d8', () => {
  // Board state where white wins by moving rook from d1 to d8
  const fen1 = '6k1/5ppp/p7/P7/5b2/7P/1r3PP1/3R2K1 w - - 0 1'
  const game1 = new Chess()
  game1.load(fen1)

  test('Game is not over', () => {
    expect(game1.game_over()).toBeFalsy()
  })

  test('After Rd8 black is checkmated', () => {
    game1.move('Rd8')
    expect(game1.turn()).toBe('b')
    expect(game1.in_checkmate()).toBe(true)
  })

  test('Game over', () => {
    expect(game1.game_over()).toBeTruthy()
  })
})

describe('En passant: possible after black pawn moves to a5', () => {
  // Board state where after black pawn moves from a7 to a5
  // White can en passant capture from b5 to a6
  const fen2 = '4k3/p2p2p1/8/1P6/4P2P/8/8/4K3 b - - 0 4'
  const game2 = new Chess()
  game2.load(fen2)

  test('White has option to capture with b5 pawn', () => {
    game2.move('a5')
    expect(game2.moves().includes('bxa6')).toBe(true)
  })

  test('After white captures a5, black no longer has pieces on "a" file', () => {
    game2.move('bxa6')
    expect(game2.moves().filter(move => move.includes('a')).length).toBe(0)
  })
})

describe('Stalemate: black moving pawn to a2 causes stalemate', () => {
  // Board state where game ends in stalemate after black pawn moves from a3 to a2
  const fen3 = '8/8/8/8/8/pk6/8/K7 b - - 1 1'
  const game3 = new Chess()
  game3.load(fen3)
  game3.move('a2')

  test('Game has ended in a draw', () => {
    expect(game3.game_over()).toBe(true)
    expect(game3.in_draw()).toBe(true)
  })

  test('Game is in stalemate', () => {
    expect(game3.in_stalemate()).toBe(true)
  })

  test('White is not in checkmate', () => {
    expect(game3.turn()).toBe('w')
    expect(game3.in_checkmate()).toBe(false)
  })
})

describe('Threefold repetition', () => {
  const game4 = new Chess()
  for (let i = 0; i < 2; i++) {
    game4.move('Na3')
    game4.move('Na6')
    game4.move('Nb1')
    game4.move('Nb8')
  }

  test('Same position has been repeated three times', () => {
    expect(game4.in_threefold_repetition()).toBe(true)
  })

  test('Game has ended in a draw', () => {
    expect(game4.game_over()).toBe(true)
    expect(game4.in_draw()).toBe(true)
  })
})

describe('Insufficient material causes game to draw', () => {
  const game5 = new Chess()

  beforeEach(() => {
    game5.reset()
  })

  // Game with only kings left
  const fen5 = '8/8/5k2/3K4/8/8/8/8 w - - 0 1'
  test('Game ends when both sides have only kings left', () => {
    game5.load(fen5)

    expect(game5.game_over()).toBe(true)
    expect(game5.in_draw()).toBe(true)
    expect(game5.insufficient_material()).toBe(true)
  })

  // Game with king and a knight vs king
  const fen6 = '8/4n3/5k2/8/2K5/8/8/8 w - - 0 1'
  test('King and a knight vs king is insufficient material', () => {
    game5.load(fen6)

    expect(game5.game_over()).toBe(true)
    expect(game5.in_draw()).toBe(true)
    expect(game5.insufficient_material()).toBe(true)
  })

  // Game with king and a bishop vs king
  const fen7 = '8/3b4/5k2/8/2K5/8/8/8 w - - 0 1'
  test('King and a bishop vs king is insufficient material', () => {
    game5.load(fen7)

    expect(game5.game_over()).toBe(true)
    expect(game5.in_draw()).toBe(true)
    expect(game5.insufficient_material()).toBe(true)
  })
})
