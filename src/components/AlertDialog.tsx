import { Box, Button, DialogActions, DialogContent, DialogTitle, FormControl, TextField, Typography } from "@mui/material"
import { forwardRef, useImperativeHandle, useState } from "react"
import { StyledDialog } from "./StyledDialog"
import { IAppContext, useAppContext } from "../contexts/AppContextProvider"

export type TAlert = {
    id: string, symbol: string, price: number, detail: string
}

type TProps = {
    onAlertUpdated: (id: string, price: number) => void
}

export type TAlertDialogRef = {
    onOpenAlertDetail: (event:Event) => void
}

const AlertDialog = forwardRef<TAlertDialogRef, TProps>(({onAlertUpdated}, ref) => {
    const appContext:IAppContext = useAppContext()
    const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false)
    const [state, setState] = useState<TAlert>({id: '', symbol: '', price: 0, detail: ''})
    const [errorMessage, setErrorMessage] = useState<string>('')

    const handleClose = () => {
        setErrorMessage('')
        setOpenAlertDialog(false);
    };

    const handleSubmit = () => {
        const detail = (document.getElementById('detail')! as HTMLInputElement).value
        const price = Number((document.getElementById('price')! as HTMLInputElement).value)
        appContext.Alert.update(state.symbol, state.id, price, detail)
        onAlertUpdated(state.id, price)
        setState(x => ({...x, price: price, detail: detail}))
        setErrorMessage('')
        handleClose()
    };

    const onOpenAlertDetail = (event:Event) => {
        appContext.Alert.getById((event as CustomEvent<TAlert>).detail.id).then(res => {
            if(res && res.length > 0) {
                setState(res[0])
                setOpenAlertDialog(true)
            }
        })
    }

    useImperativeHandle(ref, () => ({
            onOpenAlertDetail
        })
    )

    return (<div>
        <StyledDialog title="Realtime Price Line" open={openAlertDialog} onSubmit={handleSubmit} onClose={handleClose}>
            <DialogTitle id="form-dialog-title">Price Line Setting</DialogTitle>
            <DialogContent dividers={true}>
                <Box display='flex' flexDirection='column' rowGap={1}>
                    <FormControl>
                        <TextField id="price" defaultValue={Number(state.price.toFixed(2))}
                            type="number" size="small" label="Price"
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} />
                    </FormControl>
                    <FormControl>
                        <TextField id="detail" defaultValue={state.detail}
                            size="small" label="Detail" multiline={true} rows="5"/>
                    </FormControl>
                    <Typography color="error">{errorMessage}</Typography>
                </Box>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </DialogContent>
        </StyledDialog>
    </div>)
})

export default  AlertDialog