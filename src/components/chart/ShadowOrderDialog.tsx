import { Box, Button, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import './shadowOrderDialog.css'    
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export type TProps = {
    onShadowOrderUpdated: (size: number, stop: number) => void
}

export type TShadowOrderDialogState = {
    visible: boolean
    size: number
    stop: number
}

export type TShadowOrderDialogRef = {
    updateState: (state: TShadowOrderDialogState) => void
}

const ShadowOrderDialog = forwardRef<TShadowOrderDialogRef, TProps>(({onShadowOrderUpdated}, ref) => {
    const [state, setState] = useState<TShadowOrderDialogState>({visible: false, size: 0, stop: 0})
    const tradeDirection = useRef<number>(0)
    const originalState = useRef<TShadowOrderDialogState>({visible: false, size: 0, stop: 0})

    useImperativeHandle(ref, () => ({
            updateState: (inputState: TShadowOrderDialogState) => {
                tradeDirection.current = inputState.size > 0 ? 1 : -1
                const normalizedinput = {...inputState, size: Math.abs(inputState.size)} // for internal display, show size in absolute value
                setState(normalizedinput) // for display
                originalState.current = normalizedinput //for reset
            }
        })
    );

    const onReset = () => {
        if(originalState.current) {
            setState(originalState.current)
            onShadowOrderUpdated(originalState.current.size * tradeDirection.current, originalState.current.stop)
        }
    }

    const onShadowOrderChanged = (inputState: TShadowOrderDialogState) => {
        if(inputState.size < originalState.current.size) {inputState.size = originalState.current.size}
        if(inputState.stop < 0) {inputState.stop = 0}
        setState(inputState)
        onShadowOrderUpdated(inputState.size * tradeDirection.current, inputState.stop)
    }

    return state.visible && <Paper className="shadow-order-dialog">
        <Box className="shadow-order-dialog-header">
            <Typography>Shadow Order</Typography>
        </Box>
        <Box display="flex" flexDirection="column" gap={2}>
            <TextField 
                label="Size"
                size="small" 
                type="number" 
                variant="outlined" 
                value={state.size} 
                onChange={(e) => onShadowOrderChanged({...state, size: Number(e.target.value)})} />
            <TextField 
                label="Stop $" 
                type="number" 
                variant="outlined" 
                size="small"
                value={state.stop.toFixed(2)} 
                InputProps={{inputProps: { min: 0, step: 50 }, startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                onChange={(e) => onShadowOrderChanged({...state, stop: Number(e.target.value)})} />
            <Button variant="contained" onClick={onReset}>Reset</Button>
        </Box>
    </Paper>
})

export default ShadowOrderDialog;
