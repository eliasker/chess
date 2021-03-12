import React, { useState } from 'react'
import { Dialog, DialogContent, DialogActions } from '@material-ui/core'

const AlertDialog = ({ description, buttonName, acceptFunction }) => {
  const [open, setOpen] = useState(false)

  const handleAccept = () => {
    setOpen(false)
    acceptFunction()
  }

  return (
    <>
      <button onClick={() => setOpen(true)}>{buttonName}</button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogContent>{description}</DialogContent>
        <DialogActions>
          <button onClick={() => setOpen(false)}>Cancel</button>
          <button onClick={() => handleAccept()}>Yes</button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AlertDialog
