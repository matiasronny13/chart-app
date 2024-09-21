import { createChart, IChartApi, UTCTimestamp, WhitespaceData } from "lightweight-charts"
import { MutableRefObject } from "react"
import { chartOptions } from "../components/chart/chartOptions"
import { TiltData } from "../plugins/tilt-series/data"
import { TiltSeries } from "../plugins/tilt-series/tilt-series"
import ShadowOrder from "../plugins/shadow-order/shadow-order"

type TProps = {
    chartContainer:MutableRefObject<HTMLDivElement>
}

export type TOrderMapService = {
    initializeChart: () => void
    disposeChart: () => void
}

const initialData:TiltData[] = [
    {time:0 as UTCTimestamp, bias:12, avgPrice:12},
    {time:1 as UTCTimestamp, bias:10, avgPrice:15},
    {time:2 as UTCTimestamp, bias:13, avgPrice:20},
    {time:3 as UTCTimestamp, bias:15, avgPrice:25},
    {time:4 as UTCTimestamp, bias:17, avgPrice:30},
    {time:5 as UTCTimestamp, bias:19, avgPrice:35},
    {time:6 as UTCTimestamp, bias:21, avgPrice:40},
    {time:7 as UTCTimestamp, bias:23, avgPrice:45},
    {time:8 as UTCTimestamp, bias:25, avgPrice:50},
    {time:9 as UTCTimestamp, bias:27, avgPrice:55},
    {time:10 as UTCTimestamp, bias:30, avgPrice:60},
]

const useOrderMap = ({chartContainer}:TProps):TOrderMapService => {
    let chart:IChartApi

    const initializeChart = () => {
        if(chartContainer) {
            chart = createChart(chartContainer.current, chartOptions);
            chart.applyOptions({ 
                width: chartContainer.current.parentElement?.parentElement?.clientWidth,
                height: 880,
                timeScale: {
                    tickMarkFormatter: (time:number) => String(time),
                },
                localization: {
                    dateFormat: '',
                    timeFormatter: (time:number) => String(time),
                }
            });
            
            const customSeriesView = new TiltSeries();
            const myCustomSeries = chart.addCustomSeries(customSeriesView, {
                /* Options */
                lineWidth: 1,
                bandScale: 3
            });
            
            const data: (TiltData | WhitespaceData)[] = initialData
            myCustomSeries.setData(data);
            chart.timeScale().fitContent();
            
            const actualPosition = {
                "positionSize": 1,
                "stopLoss": 20.500000000,
                "takeProfit": 62.500000000,
                "toMake": 2000.000000000,
                "risk": 1998.000000000,
                "averagePrice": 33.500000000,
                "profitAndLoss": -1.000000000
            }
            const shadowPosition = {
                "positionSize": 1,
                "stopLoss": 21.500000000,
                "takeProfit": 60.500000000,
                "toMake": 2000.000000000,
                "risk": 1998.000000000,
                "averagePrice": 30.500000000,
                "profitAndLoss": -1.000000000
            }
            const shadowOrder = new ShadowOrder({actualPosition, shadowPosition, contractCost: 10}, {});
            myCustomSeries.attachPrimitive(shadowOrder);

            chart.subscribeClick((_) => {
                //shadowOrder.increaseAveragePrice()
                const lastTime = myCustomSeries.data().at(-1)?.time  as number + 1
                myCustomSeries.update({
                    time: lastTime as UTCTimestamp,
                    bias: 72,
                    avgPrice: 72
                })
            })
        }
    }

    const disposeChart = () => {
        chart && chart.remove()
        console.log('disposeChart')
    }

    return {
        initializeChart,
        disposeChart
    }
}

export default useOrderMap;