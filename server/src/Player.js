class Player {
  time = 0
  score = 0
  id = null
  username = null
  color = ""

  constructor(userID, username, color) {
    this.id = userID
    this.username = username
    this.color = color
  }

  get id() { return this.id }

  get score() { return this.score }

  get time() { return this.time }

  get color() { return this.color }

  addScore(number) { this.score += number }

  addTime(number) { this.time += number }

  setTime(newTime) { this.time = newTime }

  changeColor() { this.color === "white" ? this.color = "black" : this.color = "white" }
}

module.exports = {
  Player: Player
}
