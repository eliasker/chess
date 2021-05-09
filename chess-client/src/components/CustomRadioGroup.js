import React from 'react'
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@material-ui/core"

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

export default CustomRadioGroup
