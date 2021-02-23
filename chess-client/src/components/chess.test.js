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

describe('En passant:', () => {

})

describe('Stalemate --> draw', () => {

})

describe('Threefold repetition --> draw', () => {

})

describe('Insucient material --> draw', () => {

})
