import { AlignHorizontalRight } from "@mui/icons-material"
import { Box, Button, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, TextField, Tooltip, Typography } from "@mui/material"
import { useState } from "react"
import { StyledDialog } from "./StyledDialog"

type TProps = {
    updateRealtimePriceLine: (isEnabled: boolean, distance: number) => void
}

type TState = {
    distanceType: string
    distance: number
    isEnabled: boolean
}

const RealtimePriceLineDialog = ({ updateRealtimePriceLine }: TProps) => {
    const [openPriceLineControl, setOpenPriceLineControl] = useState<boolean>(false)
    const [state, setState] = useState<TState>({ distanceType: 'point', distance: 40, isEnabled: false })
    const [errorMessage, setErrorMessage] = useState<string>('')

    const handleClose = () => {
        setErrorMessage('')
        setOpenPriceLineControl(false);
    };

    const handleSubmit = () => {
        const distanceType = (document.getElementById('distanceType')!.nextElementSibling! as HTMLInputElement).value
        const distance = Number((document.getElementById('distance')! as HTMLInputElement).value)
        const isEnabled = (document.getElementById('isEnabled')! as HTMLInputElement).checked
        setState({ distanceType: distanceType, distance: distance, isEnabled: isEnabled })
        updateRealtimePriceLine(isEnabled, distance)
        setErrorMessage('')
        handleClose()
    };

    return (<div>
        <Button onClick={() => setOpenPriceLineControl(true)}>
            <Tooltip title="Realtime Price Lines"><AlignHorizontalRight></AlignHorizontalRight></Tooltip>
        </Button>
        <StyledDialog title="Realtime Price Line" open={openPriceLineControl} onSubmit={handleSubmit} onClose={handleClose}>
            <DialogTitle id="form-dialog-title">Price Line Setting</DialogTitle>
            <DialogContent dividers={true}>
                <Box display='flex' flexDirection='column' rowGap={1}>
                    <FormControl>
                        <InputLabel id="simple-select-label">Type</InputLabel>
                        <Select label="Type" labelId="simple-select-label" defaultValue={state.distanceType} id="distanceType" size="small">
                            <MenuItem value={'point'}>Points</MenuItem>
                            <MenuItem value={'tick'}>Ticks</MenuItem>
                            <MenuItem value={'percent'}>Percent</MenuItem>
                            <MenuItem value={'currency'}>Currency</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl>
                        <TextField id="distance" defaultValue={state.distance}
                            type="number" size="small" label="distance"
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} />
                    </FormControl>
                    <FormControlLabel control={<Switch id="isEnabled" defaultChecked={state.isEnabled} />} label="Enabled" />
                    <Typography color="error">{errorMessage}</Typography>
                </Box>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </DialogContent>
        </StyledDialog>
    </div>)
}

export default RealtimePriceLineDialog;