import { ChangeEvent, forwardRef, useImperativeHandle, useRef, useState } from "react"
import { Box, Divider, FormControlLabel, MenuItem, SelectChangeEvent, Switch, Tooltip } from "@mui/material"
import { StyledSelect } from "./StyledSelect"
import { StyledTab, StyledTabs } from "./StyledTabs"
import DateRangeDialog from "./DateRangeDialog"
import hookConfig from "../configs/appConfig"
import { Time } from "lightweight-charts"
import RealtimePriceLineDialog from "./RealtimePriceLineDialog"
import DailyLevelDialog from "./DailyLevelDialog"
import { TDataConfig, TLevelDetail } from "../shared/types"
import AccountSelect, { TAccountSelectRef } from "./AccountSelect"

type TProps = {
    eventHandlers: TToolbarEventHandlers
}

export type TToolbarEventHandlers = {
    onStateChanged: (state: TDataConfig) => void
    onRealtimePriceLineChanged: (isEnabled: boolean, distance: number) => void
    onTiltChanged: (isChecked:boolean) => void
    onTradeReportChanged: (accountId:number, isChecked:boolean) => void
    onLevelSubmitted: (selectedValues:Map<string, TLevelDetail>) => void
    onShadowOrderChanged: (isChecked:boolean) => void
}

export interface IToolbarRef {
    updateState: (state:TDataConfig) => void
}

const Toolbar = forwardRef<IToolbarRef, TProps>(({eventHandlers}, ref) => {
    const [toolbarState, setToolbarState] = useState<TDataConfig>(hookConfig.defaultParam)
    const accountSelectRef = useRef<TAccountSelectRef>(null)
    const isTradeEnabled = useRef<boolean>(false)
    const levelState = useRef<Map<string, TLevelDetail>>(new Map())

    useImperativeHandle(ref, () => ({
            updateState: (state:TDataConfig) => {
                setToolbarState(state)
            }
        })
    )

    const onSymbolChange = ((event: SelectChangeEvent<unknown>) => {
        const selectedValue = event?.target.value as string
        const timeNow = Math.round(Date.now() / 1000) as Time
        const newState = { ...toolbarState, symbol: selectedValue, from: timeNow, to: timeNow }
        setToolbarState(newState)
        eventHandlers.onStateChanged(newState)
        eventHandlers.onLevelSubmitted(levelState.current) 
    })

    const onTimeframeChange = (_: React.SyntheticEvent, value: string) => {
        const timeNow = Math.round(Date.now() / 1000) as Time
        const newState = { ...toolbarState, resolution: value, from: timeNow, to: timeNow }
        setToolbarState(newState)
        eventHandlers.onStateChanged(newState)
    }

    const dateRangeSubmit = (from: number, to: number) => {
        const newState = { ...toolbarState, from: from as Time, to: to as Time }
        setToolbarState(newState)
        eventHandlers.onStateChanged(newState)
    }

    const updateRealtimePriceLine = (isEnabled: boolean, distance: number) => {
        eventHandlers.onRealtimePriceLineChanged(isEnabled, distance)
    }

    const updateTradeReport = (event:ChangeEvent<HTMLInputElement>) => {
        isTradeEnabled.current = event.currentTarget.checked        
        eventHandlers.onTradeReportChanged(accountSelectRef.current!.currentSelectedAccount(), isTradeEnabled.current)
    }

    const onTiltChanged = (event:ChangeEvent<HTMLInputElement>) => {
        eventHandlers.onTiltChanged(event.currentTarget.checked)
    }

    const onAccountChanged = (selectedAccount:number) => {
        eventHandlers.onTradeReportChanged(selectedAccount, isTradeEnabled.current)
    }

    const onLevelSubmit = (selectedValues:Map<string, TLevelDetail>) => {
        levelState.current = selectedValues
        eventHandlers.onLevelSubmitted(selectedValues) 
    }

    return (
        <Box display={"flex"} justifyContent={"left"} paddingX={3}>
            <AccountSelect ref={accountSelectRef} accountChanged={onAccountChanged}></AccountSelect>
            <StyledSelect variant="standard" margin="none" value={toolbarState.symbol} onChange={onSymbolChange}>
                {
                    Object.keys(hookConfig.websocketSymbolMapping).map(item =>
                        <MenuItem key={item} value={item}>{item}</MenuItem>
                    )
                }
            </StyledSelect>

            <Divider orientation="vertical" flexItem ></Divider>

            <StyledTabs value={toolbarState.resolution} onChange={onTimeframeChange}>
                {
                    Object.entries(hookConfig.timeframeOptions).sort((a, b) => a[1].order - b[1].order).map(key =>
                        <StyledTab key={key[0]} label={key[1].label} value={key[0]}></StyledTab >
                    )
                }
            </StyledTabs>

            <Divider orientation="vertical" flexItem></Divider>

            <DateRangeDialog onSubmit={dateRangeSubmit} from={toolbarState.from} to={toolbarState.to}></DateRangeDialog>
            <RealtimePriceLineDialog updateRealtimePriceLine={updateRealtimePriceLine}></RealtimePriceLineDialog>
            <DailyLevelDialog onSubmit={onLevelSubmit}></DailyLevelDialog>
            <Tooltip title="Show Tilt"><FormControlLabel control={<Switch defaultChecked={false} onChange={onTiltChanged} />} label="Tilt" /></Tooltip>
            <Tooltip title="Show Trades"><FormControlLabel control={<Switch defaultChecked={false} onChange={updateTradeReport} />} label="Trades" /></Tooltip>
            <Tooltip title="Show Shadow Order"><FormControlLabel control={<Switch defaultChecked={false} onChange={(event:ChangeEvent<HTMLInputElement>) => { eventHandlers.onShadowOrderChanged(event.currentTarget.checked)}} />} label="Shadow" /></Tooltip>
        </Box>
    )
})

export default Toolbar