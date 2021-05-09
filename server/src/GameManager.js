const { Player } = require('./Player')

/**
 * Manages a map<gameID, game> of gamerooms
 * Operations: Add, remove, getGameByID, getGamesAsList,
 * ...add player (or spectator), remove player, 
 * ...update boardstate, handle end of game, start a new game
 */
class GameManager {

  constructor() {
    this.games = new Map()
  }


  addGame(game) { this.games.set(game.id, game) }


  getGameByID(gameID) { return this.games.get(gameID) }


  getListOfGames() { return Array.from(this.games.values()) }


  removeGame(gameID) { this.games.delete(gameID) }

  /**
   * Add user to player slot and/or add socket to games connections
   * @param {*} user {id, name}
   * @param {*} socketID socket that 'subscribes' updates from this game
   * @param {*} gameID 
   * @param {*} joinAsPlayer user is either playing or spectating
   */
  addUser(user, socketID, gameID, joinAsPlayer) {
    const game = this.games.get(gameID)
    if (joinAsPlayer) {
      const newPlayer = new Player(
        user.id,
        user.name,
        game.host.color === 'white' ? 'black' : 'white',
        game.time
      )
      this.games.get(gameID).player = newPlayer
    }

    game.connections.add(socketID)
  }

  /**
   * Removes disconnecting user.
   * If user is host the game is terminated.
   * if user is player the player replaced with blakn player.
   * @param {*} userID who is disconnecting
   * @param {*} gameID 
   * @param {*} socketID connection that no longer receives updates
   */
  removeUser(userID, gameID, socketID) {
    const game = this.games.get(gameID)
    game.connections.delete(socketID)

    if (userID === game.player.id) {
      game.player = { time: 0, score: 0, id: null, color: '' }
    } else if (userID === game.host.id) {
      this.games.delete(gameID)
    }
  }


  /**
   * Replaces old boardstate with a new state
   * Increment is added to players time who made the move
   * @param {*} userID 
   * @param {*} gameID 
   * @param {*} newState 
   */
  updateBoardState(userID, gameID, newState) {
    const game = this.games.get(gameID)
    game.state = newState
    game.turn = game.turn === 'w' ? 'b' : 'w'

    if (game.host.id === userID) game.host.addTime(game.increment)
    else game.player.addTime(game.increment)
  }


  /**
   * Resets time, winner and turn
   * Players switch sides
   * @param {*} gameID 
   */
  restartGame(gameID) {
    const game = this.games.get(gameID)
    game.host.changeColor()
    game.host.setTime(game.time)
    game.player.changeColor()
    game.player.setTime(game.time)
    game.winner = null
    game.turn = 'w'
  }


  /**
   * Adds score to winning player
   * Sets winning players id as game.winner (or 'draw')
   * @param {*} userID Who caused game to end
   * @param {*} gameID 
   * @param {*} result Win, loss or draw
   */
  handleGameOver(userID, gameID, result) {
    const game = this.games.get(gameID)
    const isHost = game.host.id === userID
    switch (result) {
      case 'win':
        isHost ? game.host.addScore(1) : game.player.addScore(1)
        game.winner = isHost ? game.host.name : game.player.name
        break;

      case 'draw':
        game.host.addScore(0.5)
        game.player.addScore(0.5)
        game.winner = 'draw'
        break;

      case 'loss':
        isHost ? game.player.addScore(1) : game.host.addScore(1)
        game.winner = isHost ? game.player.name : game.host.name
        break;

      default:
        break;
    }
  }
}

module.exports = {
  GameManager: GameManager
}
