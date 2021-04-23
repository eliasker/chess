import React, { useContext, useState } from 'react'
import Context from '../context/Context'
import { v4 as uuidv4 } from 'uuid'
import { ClickAwayListener, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@material-ui/core'

import { initialPlayer, initialGameroom } from '../Constants'

const CreateGame = () => {
  const [open, setOpen] = useState(false)
  const colors = ['white', 'black', 'random']
  const timeOptions = ['casual', '1', '3', '5', '10']
  const incrementOptions = ['none', '1', '2', '5']
  const [selectedColor, setSelectedColor] = useState(colors[0])
  const [time, setTime] = useState(timeOptions[0])
  const [increment, setIncrement] = useState(incrementOptions[0])
  const {
    user,
    setSelectedGame,
    emitCreateGame,
    setErrorMessage
  } = useContext(Context)

  const handleCreate = async () => {
    const newHost = {
      ...initialPlayer,
      id: user.userID,
      time: isNaN(time) ? null : 60000 * +time,
      username: user.username,
      color: selectedColor === 'random' ?
        (Math.random() > 0.5 ? 'white' : 'black') : selectedColor
    }

    const newGameRoom = {
      ...initialGameroom,
      id: uuidv4(),
      host: newHost,
      time: isNaN(time) ? null : 60000 * +time,
      increment: isNaN(increment) ? null : +increment
    }

    const { success, message } = await emitCreateGame(newGameRoom)
    success ? setSelectedGame(newGameRoom) : setErrorMessage(message)
    setOpen(false)
  }

  const CustomRadioGroup = ({ label, options, optionState, setOption }) => {
    const handleChange = (event) => setOption(event.target.value)
    return (
      <FormControl component='fieldset'>
        <FormLabel component='legend'>{label}</FormLabel>
        <RadioGroup aria-label={label} name={label} value={optionState} onChange={handleChange}>
          {options.map((o, index) =>
            <FormControlLabel key={`${label}option${index}`} value={o} control={<Radio />} label={o} />
          )}
        </RadioGroup>
      </FormControl>
    )
  }

  // TODO: option to set gameRoom invite only
  const CreateGameOptions = () => {
    return (
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <div>
          <CustomRadioGroup label={'Color'} options={colors}
            optionState={selectedColor} setOption={setSelectedColor}
          />
          <CustomRadioGroup label={'Time'} options={timeOptions}
            optionState={time} setOption={setTime}
          />
          <CustomRadioGroup label={'Increment'} options={incrementOptions}
            optionState={increment} setOption={setIncrement}
          />
          <div className='center-container'>
            <button onClick={() => handleCreate()}>Create</button>
            <button onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      </ClickAwayListener>
    )
  }

  return (
    <div className='create-game'>
      {open ?
        <CreateGameOptions /> :
        <button onClick={() => setOpen(true)}>Create game</button>
      }
    </div>
  )
}

export default CreateGame
