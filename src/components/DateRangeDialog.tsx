import { Box, Button, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemButton, ListItemText, Tooltip, Typography } from '@mui/material';
import { CalendarIcon, DateTimePicker, LocalizationProvider, PickersActionBarProps, pickersLayoutClasses } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Time } from 'lightweight-charts';
import { useState } from 'react';
import { StyledDialog } from './StyledDialog';

type TProps = {
    onSubmit: (from: number, to: number) => void
    from: Time,
    to: Time
}

function ActionList(props: PickersActionBarProps) {
    const { onAccept, onClear, onCancel, onSetToday, className } = props;
    const actions = [
        { text: 'Accept', method: onAccept },
        { text: 'Clear', method: onClear },
        { text: 'Cancel', method: onCancel },
        { text: 'Today', method: onSetToday },
    ];
    return (
        // Propagate the className such that CSS selectors can be applied
        <List className={className}>
            {actions.map(({ text, method }) => (
                <ListItem key={text} disablePadding>
                    <ListItemButton onClick={method}>
                        <ListItemText primary={text} />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}

const DateRangeDialog = (props: TProps) => {
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("")
    let fromState:Dayjs|null = dayjs(props.from as number * 1000).second(0)
    let toState:Dayjs|null = dayjs(props.to as number * 1000).second(0)

    const handleClose = () => {
        setOpenDatePicker(false);
    };

    const handleSubmit = () => {
        if(fromState && toState) {
            if(fromState > toState) {
                setErrorMessage(() => "Starting date cannot be later than ending date")
            }
            else {
                handleClose();
                props.onSubmit(fromState.unix(), toState.unix())
            }
        }
        else {
            setErrorMessage(() => "Select both dates")
        }
    };

    return (
        <div>
            <Button onClick={() => setOpenDatePicker(true)}>
                <Tooltip title="Date Range"><CalendarIcon></CalendarIcon></Tooltip>
            </Button>   
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <StyledDialog open={openDatePicker} onClose={handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Select date range</DialogTitle>
                    <DialogContent dividers={true}>
                        <DialogContentText></DialogContentText>
                        <Box display={'flex'} columnGap={1}>
                            <DateTimePicker 
                                onChange={(value) => { fromState = value}}
                                slotProps={{
                                    layout: {
                                        sx: {
                                            [`.${pickersLayoutClasses.actionBar}`]: {
                                                gridColumn: 1,
                                                gridRow: 2,
                                            },
                                        },
                                    },
                                }}
                                slots={{
                                    actionBar: ActionList,
                                }}
                                value={fromState}/>
                            <DateTimePicker 
                                onChange={(value) => { toState = value}}
                                slotProps={{
                                    layout: {
                                        sx: {
                                            [`.${pickersLayoutClasses.actionBar}`]: {
                                                gridColumn: 1,
                                                gridRow: 2,
                                            },
                                        },
                                    },
                                }}
                                slots={{
                                    actionBar: ActionList,
                                }}
                                value={toState}/>
                        </Box>
                        <Typography color="error">{errorMessage}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} color="primary">
                            Submit
                        </Button>
                    </DialogActions>
                </StyledDialog>
            </LocalizationProvider>
        </div>
    );
};

export default DateRangeDialog