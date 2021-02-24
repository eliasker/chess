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
  // board state where white wins by moving rook from d1 to d8
  const fen1 = "6k1/5ppp/p7/P7/5b2/7P/1r3PP1/3R2K1 w - - 0 1"
  const game1 = new Chess()
  game1.load(fen1)

  test('Game is not over', () => {
    expect(game1.game_over()).toBeFalsy()
  })

  test('After Rd8 black is checkmated', () => {
    game1.move("Rd8")
    expect(game1.turn()).toBe("b")
    expect(game1.in_checkmate()).toBe(true)
  })

  test('Game over', () => {
    expect(game1.game_over()).toBeTruthy()
  })
})

describe('En passant: After black moves to a5', () => {
  // Boardstate where after black pawn moves from a7 to a5
  // White can en passant capture from b5 to a6 
  const fen2 = "4k3/p2p2p1/8/1P6/4P2P/8/8/4K3 b - - 0 4"
  const game2 = new Chess()
  game2.load(fen2)

  test('White has option to capture with b5 pawn', () => {
    game2.move("a5")
    expect(game2.moves().includes("bxa6")).toBe(true)
  })

  test('After white captures a5, black no longer has pieces on "a" file', () => {
    game2.move("bxa6")
    expect(game2.moves().filter(move => move.includes("a")).length).toBe(0)
  })
})

describe('Stalemate --> draw', () => {

})

describe('Threefold repetition --> draw', () => {

})

describe('Insucient material --> draw', () => {

})
