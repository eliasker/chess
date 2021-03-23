import React, { useState } from 'react'
import { ClickAwayListener } from '@material-ui/core'

const ConfirmButton = ({ disable, description, buttonName, acceptFunction }) => {
  const [open, setOpen] = useState(false)
  const handleClickAway = () => setOpen(false)
  const handleClick = () => setOpen(!open)
  const handleConfirm = () => {
    handleClickAway()
    acceptFunction()
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div>
        {open ?
          <span>
            {description}
            <button onClick={handleClickAway} style={{ marginLeft: 10 }}>
              Cancel</button>
            <button onClick={handleConfirm}>Confirm</button>
          </span>
          :
          <button disabled={disable} onClick={handleClick}>{buttonName}</button>
        }
      </div>
    </ClickAwayListener>
  )
}

export default ConfirmButton
