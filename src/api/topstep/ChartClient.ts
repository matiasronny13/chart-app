import { CandlestickData, HistogramData, Time } from "lightweight-charts"
import { getBarColor } from "../../shared/utils"
import { IException } from "../../shared/interfaces"
import hookConfig from "../../configs/appConfig"
import { TDataConfig } from "../../shared/types"


type THistoricalData = {
    lastTimestamp: Time
    isLastBarRealtime: boolean
    price: CandlestickData<Time>[]
    volume: HistogramData<Time>[]
}

type TBarData = { t: number, o:number, h:number, c:number, l:number, v:number }

export class ChartClient {
    private readonly _token:string

    constructor(token: string) { 
        this._token = token
    }
    
    private newHistoricalData = ():THistoricalData => ({
        lastTimestamp:0 as Time, 
        price:[], 
        volume:[], 
        isLastBarRealtime:false
    })

    private reshapeTimeframe(bars: TBarData[]): THistoricalData {
        const result: THistoricalData = this.newHistoricalData()
        const hourBegins = [22, 2, 6, 10, 14, 18]
        const barsCount = bars.length

        let resultLastIndex = -1
        let skip = 0
        for(let i=barsCount-1; i >= 0; i--) {
            const utcHour = new Date(bars[i].t).getUTCHours()
            if(this._isValidBar(bars[i]) && hourBegins.includes(utcHour)) {
                break
            }                
            else {
                skip++
            }
        }        

        for(let i=barsCount-(1+skip); i >= 0; i--) {
            const bar = bars[i]
            if(this._isValidBar(bar)) {
                const barTimeInSecond = bar.t / 1000
                if(result.price.length > 0 && barTimeInSecond - (result.price[resultLastIndex].time as number) < 14400) {
                    result.price[resultLastIndex].high = Math.max(result.price[resultLastIndex].high, bar.h)
                    result.price[resultLastIndex].low = Math.min(result.price[resultLastIndex].low, bar.l) 
                    result.price[resultLastIndex].close = bar.c
        
                    result.volume[resultLastIndex].value += bar.v
                    result.volume[resultLastIndex].color = getBarColor(result.price[resultLastIndex].open, result.price[resultLastIndex].close)
                }
                else {
                    result.price.push({
                        time: barTimeInSecond as Time, 
                        open: bar.o, 
                        high: bar.h, 
                        low: bar.l, 
                        close: bar.c 
                    })
        
                    result.volume.push({ 
                        time: barTimeInSecond as Time, 
                        value: bar.v, 
                        color: getBarColor(bar.o, bar.c)
                    })
                    resultLastIndex++
                    result.lastTimestamp = barTimeInSecond as Time
                }
            }
        }

        return result
    }

    private _isValidBar = (bar:TBarData):boolean => !(bar.o == bar.c && bar.o == bar.h && bar.o == bar.l)

    async getHistoricalData({symbol, resolution, from, to}: TDataConfig): Promise<THistoricalData> {
        let result: THistoricalData = this.newHistoricalData()
        
        try {
            const customRangeCountback = (((to as number) - (from as number))/hookConfig.timeframeOptions[resolution].unix)
            const countback = `&countback=${(from == to) ? hookConfig.timeframeOptions[resolution].countback : customRangeCountback}`
            const response = await fetch(`https://chartapi.topstepx.com/history/v2?symbol=%2F${symbol}&resolution=${resolution}&from=${from}&to=${to}${countback}`, {
                headers: {
                    'Authorization': `Bearer ${this._token}`,
                    'Content-Type': 'application/json' // Optional additional headers
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const jsonResponse = await response.json();
            
            if (jsonResponse['bars'].length > 0) {
                const bars:TBarData[] = jsonResponse['bars']
                if(resolution == '240') {
                    result = this.reshapeTimeframe(bars)
                }
                else {
                    for(let i=bars.length-1; i>=0; i--) {
                        const bar = bars[i]
                        if(this._isValidBar(bar)) {
                            const barTimeInSecond:Time = (bar.t / 1000) as Time
                            if((from == to || from < barTimeInSecond) && barTimeInSecond < to) {  // unless from == to, then element has to be between both numbers, otherwise only check toTimeStamp
                                result.price.push({ 
                                    time: barTimeInSecond, 
                                    open: bar.o, 
                                    high: bar.h, 
                                    low: bar.l, 
                                    close: bar.c 
                                })
            
                                result.volume.push({ 
                                    time: barTimeInSecond, 
                                    value: bar.v, 
                                    color: getBarColor(bar.o, bar.c)
                                })
            
                                result.lastTimestamp = barTimeInSecond as Time
                            }
                            else {
                                console.log(`overlapping data ${i}: ${bar.t}`)
                            }
                        }
                    }
                }
                
                const bufferMilisecond = 10000
                const timeframeConfig = hookConfig.timeframeOptions[resolution]
                if(timeframeConfig.realtimeEnabled) {
                    result.isLastBarRealtime = ((result.lastTimestamp as number) + timeframeConfig.unix + bufferMilisecond > Math.round(Date.now() / 1000))
                }
            }
        } catch (error) {
            console.log((error as IException).message);
        } 

        return result
    }
}