import { Box } from "@mui/material";
import { CandlestickData, Time } from "lightweight-charts";
import { forwardRef, useImperativeHandle, useState } from "react"
import './topOverlay.css'

export interface ITopOverlay {
    updateQuote: (data: CandlestickData<Time>) => void
    updateRealtimeStatus: (data: boolean) => void
}

const TopOverlay = forwardRef<ITopOverlay, unknown>((_, ref) => {
    const [quote, setQuote] = useState<CandlestickData<Time>>()
    const [isRealtime, setIsRealtime] = useState<boolean>(false)
    useImperativeHandle(ref, () => 
        ({
            updateQuote: (data: CandlestickData<Time>) => {
                setQuote(data)
            },
            updateRealtimeStatus: (data: boolean) => {
                setIsRealtime(data)
            }
        })
    );

    return (<Box className="top-overlay">
        <div className={isRealtime ? "online" : "offline"}></div>
        {
            quote && (<>
                <span><span>O</span><span className='legend-value'>{quote?.open.toFixed(2)}</span></span>
                <span><span>H</span><span className='legend-value'>{quote?.high.toFixed(2)}</span></span>
                <span><span>L</span><span className='legend-value'>{quote?.low.toFixed(2)}</span></span>
                <span><span>C</span><span className='legend-value'>{quote?.close.toFixed(2)}</span></span>
            </>)
        }
    </Box>)
})

export default TopOverlay