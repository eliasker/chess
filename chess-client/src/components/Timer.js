import React, { useEffect, useState } from 'react'

const Timer = ({ milliseconds, gameStarted, timerOn, setTimeUsed, handleOutOfTime }) => {
  const [timeStr, setTimeStr] = useState('')

  useEffect(() => {
    if (!gameStarted || !timerOn) return
    let i = 0
    const timer = setInterval(() => {
      i += 100
      if (i === milliseconds) {
        console.log('i', i, 'ms', milliseconds)
        handleOutOfTime()
      }
      if (i % 1000 === 0) {
        const minutes = Math.floor((milliseconds - i) / 60000)
        const seconds = (((milliseconds - i) % 60000) / 1000).toFixed(0)
        const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`
        const secStr = seconds < 10 ? `0${seconds}` : `${seconds}`
        const str = `${minStr}:${secStr}`
        setTimeStr(str)
      }
      setTimeUsed(i)
    }, 100)
    return () => {
      clearTimeout(timer)
    }
  }, [milliseconds, gameStarted, timerOn, setTimeUsed])

  return (
    <p>{timeStr}</p>
  )
}

export default Timer
