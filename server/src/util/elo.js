/**
 * How likely it is that player 1 wins vs player 2
 * @param {*} R1 player 1 elo
 * @param {*} R2 player 2 elo
 * @returns Expected score E, a number between 0.0 and 1.0
 */
const expectedScore = (R1, R2) => {
  const diff = R2 - R1
  const E = 1 / (1 + Math.pow(10, (diff / 400)))
  return E
}

/**
 * @param {*} R - players elo
 * @returns K-factor, bigger K means more larger elo changes
 * Basically low elo players gain and lose more than players in high elo
 * Rating thresholds are from US Chess Federation
 */
const calc_K_factor = R => {
  let K = 24
  if (R < 2100) K = 32
  else if (R > 2400) K = 16
  return K
}

/**
 * @param {*} gameResult 'w', 'd' or 'l', describes 1st players result
 * @param {*} R1 player 1 elo 
 * @param {*} R2 player 2 elo 
 * @returns updated R1 and R2 
 */
const updateElo = (gameResult, R1, R2) => {
  const K1 = calc_K_factor(R1)
  const K2 = calc_K_factor(R2)
  const E1 = expectedScore(R1, R2)
  const E2 = expectedScore(R2, R1)

  let newR1 = R1
  let newR2 = R2

  switch (gameResult) {
    case 'w':
      newR1 = R1 + K1 * (1 - E1)
      newR2 = R2 + K2 * (0 - E2)
      break;
    case 'd':
      newR1 = R1 + K1 * (0.5 - E1)
      newR2 = R2 + K2 * (0.5 - E2)
      break;
    case 'l':
      newR1 = R1 + K1 * (0 - E1)
      newR2 = R2 + K2 * (1 - E2)
      break;
    default:
      break;
  }

  newR1 = Math.floor(newR1)
  newR2 = Math.floor(newR2)

  return { newR1, newR2 }
}

export default updateElo
