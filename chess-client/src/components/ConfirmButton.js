import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { ClickAwayListener } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative'
  },
  dropdown: {
    top: 28,
    right: 0,
    left: 0,
    zIndex: 1,
    border: '1px solid',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper
  }
}))

const ConfirmButton = ({ disable, description, buttonName, acceptFunction }) => {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const handleClickAway = () => setOpen(false)
  const handleClick = () => setOpen(!open)
  const handleConfirm = () => {
    handleClickAway()
    acceptFunction()
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div className={classes.root}>
        <button disabled={disable} onClick={handleClick}>{buttonName}</button>
        {open ? (
          <div className={classes.dropdown}>
            {description}
            <button onClick={handleClickAway}>
              Cancel</button>
            <button onClick={handleConfirm}>Confirm</button>
          </div>)
          : null}
      </div>
    </ClickAwayListener>
  )
}

export default ConfirmButton
