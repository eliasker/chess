import React from 'react'
import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

const ErrorMessage = ({ errorMessage, setErrorMessage }) => {
  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={errorMessage !== ''}
      >
        <Alert onClose={() => setErrorMessage('')} severity='error'>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ErrorMessage
