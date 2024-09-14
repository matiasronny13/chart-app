import { Box, Button, Checkbox, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, Tooltip } from "@mui/material"
import { StyledDialog } from "./StyledDialog"
import { coaches } from "../shared/constants"
import { ChangeEvent, useRef, useState } from "react"
import { Sports } from "@mui/icons-material"
import { TLevelDetail } from "../shared/types"

type TProps = {
    onSubmit: (selectedValues:Map<string, TLevelDetail>) => void
}

const DailyLevelDialog = ({onSubmit}: TProps) => {
    const [openLevelDialog, setOpenLevelDialog] = useState<boolean>(false)
    const coachesSelectionLocal = localStorage.getItem('coachesSelection')
    const coachesSelection =  coachesSelectionLocal ? JSON.parse(coachesSelectionLocal) : coaches.map(a => ([a, {checked: false, color:'#03b1fc'}]))
    const checkboxState = useRef<Map<string, TLevelDetail>>(new Map(coachesSelection))
   
    const handleClose = () => {
        setOpenLevelDialog(false);
    };

    const handleSubmit = () => {
        localStorage.setItem('coachesSelection', JSON.stringify(Array.from(checkboxState.current)))
        onSubmit(new Map<string, TLevelDetail>(Array.from(checkboxState.current.entries()).filter(a => a[1].checked == true)))
        handleClose()
    };

    const handleCheckboxChanged = (coachName:string, isChecked:boolean) => {
        checkboxState.current.get(coachName)!.checked = isChecked
    }

    const CheckboxControl = (key:string, value:TLevelDetail) => (<>
        <Checkbox defaultChecked={value.checked} onChange={(event:ChangeEvent<HTMLInputElement>) => handleCheckboxChanged(key, event.target.checked)}/>
        <Box width={15} height={15} borderRadius={10} sx={{background:value.color}} mx={2}></Box>
    </>)

    return (<div>
        <Button onClick={() => setOpenLevelDialog(true)}>
            <Tooltip title="Daily Levels"><Sports></Sports></Tooltip>
        </Button>   

        <StyledDialog title="Realtime Price Line" open={openLevelDialog} onSubmit={handleSubmit} onClose={handleClose}>
            <DialogTitle id="form-dialog-title">Price Line Setting</DialogTitle>
            <DialogContent dividers={true}>
                <Box display='flex' flexDirection='column'>
                    <FormGroup>
                        {
                            checkboxState.current && Array.from(checkboxState.current.entries()).map(([key, value]) => (
                                <FormControlLabel key={key} control={CheckboxControl(key, value)} label={key} />
                            ))
                        }
                    </FormGroup>
                </Box>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </DialogContent>
        </StyledDialog>
    </div>)
}

export default DailyLevelDialog