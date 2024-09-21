import { MutableRefObject, RefObject, useCallback, useRef } from "react"
import { CandlestickData, createChart, CustomData, HistogramData, IChartApi, IPriceLine, ISeriesApi, ISeriesPrimitive, LineStyle, MouseEventParams, SeriesMarker, Time, UTCTimestamp } from "lightweight-charts"
import { candlestickOptions, chartOptions, volumeOptions } from "../components/chart/chartOptions"
import useDebounce from "./useDebounce"
import { TDataConfig, TLevelDetail, TRealtimeEventData, TRealtimeQuoteData, TRealtimrPriceLine, TiltJson, TTrade, TCustomSeriesApi, TPositionJson } from "../shared/types.ts"
import { CustomPrimitiveType, CustomSeriesType, StreamEvent } from "../shared/constants.ts"
import hookConfig from "../configs/appConfig.ts"
import { UserPriceAlerts } from "../plugins/user-price-alerts/user-price-alerts.ts"
import { UserAlertInfo } from "../plugins/user-price-alerts/state.ts"
import { ITopOverlay } from "../components/chart/TopOverlay.tsx"
import { TradeLine } from "../plugins/trade-line/trade-line.ts"
import { useUserContext } from "../contexts/UserContextProvider.tsx"
import { useAppContext } from "../contexts/AppContextProvider.tsx"
import { useChartContext } from "../contexts/ChartContextProvider.tsx"
import { SubscriptionManager } from "./SubscriptionManager.ts"
import { TiltSeries } from "../plugins/tilt-series/tilt-series.ts"
import { TiltData } from "../plugins/tilt-series/data.ts"
import { TiltSeriesOptions } from "../plugins/tilt-series/options.ts"
import { TShadowOrderDialogRef } from "../components/chart/ShadowOrderDialog.tsx"
import ShadowOrder from "../plugins/shadow-order/shadow-order.ts"


export interface IChartService {
    updateState: (state: TDataConfig) => void
    toogleRealtimePriceLine: (isEnabled:boolean, distance: number) => void
    updateAlert: (id: string, price: number) => void
    toogleTradeReport: (accountId:number, isChecked:boolean) => void
    toogleTilt: (isChecked:boolean) => void
    updateLevels: (selectedValues:Map<string, TLevelDetail>) => void
    initializeChart: () => void
    disposeChart: () => void
    toogleShadowOrder:(isChecked:boolean) => void
    updateShadowOrder: (size: number, stop: number) => void
}

type TProps = {
    onStateChanged: (state: TDataConfig) => void
    openAlertDetail: (event:Event) => void
    chartContainer: MutableRefObject<HTMLDivElement>
    topOverlayContainer: RefObject<ITopOverlay>
    shadowOrderDialogRef: RefObject<TShadowOrderDialogRef>
}

const useChart = ({onStateChanged, openAlertDetail, chartContainer, topOverlayContainer, shadowOrderDialogRef}: TProps): IChartService => {
    const appContext = useAppContext()
    const userContext = useUserContext()
    const chartContext = useChartContext()
    const paramState = useRef<TDataConfig>(hookConfig.defaultParam)
    const chart = useRef<IChartApi | null>(null)    
    const candlestickSeries = useRef<ISeriesApi<"Candlestick", Time>>() 
    const volumeSeries = useRef<ISeriesApi<"Histogram", Time>>()
    const subscriptionManager = new SubscriptionManager(paramState, chartContext.Stream)
    const customSeriesMap = new Map<CustomSeriesType, TCustomSeriesApi<CustomData>>()
    const customPrimitiveMap = useRef<Map<CustomPrimitiveType, unknown>>(new Map())
    const realtimePriceLine:TRealtimrPriceLine = { distance:0, upperLine: undefined , lowerLine: undefined}
    
    const onWindowsMouseUp = useCallback(() => {
        if(chart.current && candlestickSeries.current) {
            const currentVisibleLogicalRange = chart.current.timeScale().getVisibleLogicalRange()

            if (currentVisibleLogicalRange) {            
                const barsInfo = candlestickSeries.current.barsInLogicalRange(currentVisibleLogicalRange);            
                
                if (barsInfo !== null && barsInfo?.barsBefore && barsInfo?.barsBefore < -10) {
                    const lastExistingTimestamp = candlestickSeries.current.data()[0].time
                    chartContext.Historical.getHistoricalData({...paramState.current, from: lastExistingTimestamp, to: lastExistingTimestamp}).then(res => {
                        candlestickSeries.current?.setData([...res.price, ...candlestickSeries.current.data()])
                        volumeSeries.current?.setData([...res.volume, ...volumeSeries.current.data()])
                    })
                }
            }
        }
    }, [])    
    const [debouncedMouseUp] = useDebounce(onWindowsMouseUp, 200); // preventing double click to trigger download twice

    const renderRealtimePriceLine = (realtimeData: TRealtimeEventData) => {        
        if(realtimePriceLine.distance > 0) {
            if(realtimePriceLine.upperLine) {
                realtimePriceLine.upperLine.applyOptions({price: realtimeData.price.close + realtimePriceLine.distance, title: realtimePriceLine.distance.toString()})
            }
            else {
                realtimePriceLine.upperLine = candlestickSeries.current?.createPriceLine({
                    price: realtimeData.price.close + realtimePriceLine.distance,
                    color: '#e82709',
                    lineWidth: 1,
                    lineStyle: 1,
                    axisLabelVisible: true,
                    title: realtimePriceLine.distance.toString(),
                })
            }

            if(realtimePriceLine.lowerLine) {
                realtimePriceLine.lowerLine.applyOptions({price: realtimeData.price.close - realtimePriceLine.distance, title: realtimePriceLine.distance.toString()})
            }
            else {
                realtimePriceLine.lowerLine = candlestickSeries.current?.createPriceLine({
                    price: realtimeData.price.close - realtimePriceLine.distance,
                    color: '#e82709',
                    lineWidth: 1,
                    lineStyle: 1,
                    axisLabelVisible: true,
                    title: realtimePriceLine.distance.toString(),
                })
            }
        }
    }

    const realtimeBarHandler = (data: Event) => {
        const dataDetail = (data as CustomEvent<TRealtimeEventData>).detail
        candlestickSeries.current?.update(dataDetail.price)
        volumeSeries.current?.update(dataDetail.volume)

        renderRealtimePriceLine(dataDetail)
    }

    const realtimeQuoteHandler = (data: Event) => {
        const dataDetail = (data as CustomEvent<TRealtimeQuoteData>).detail
        const lastCandlestick:CandlestickData<Time> = {...candlestickSeries.current?.data().slice(-1)[0], close: dataDetail.lastPrice} as CandlestickData<Time>
        lastCandlestick.high = Math.max(dataDetail.lastPrice, lastCandlestick.high)
        lastCandlestick.low = Math.min(dataDetail.lastPrice, lastCandlestick.low)

        candlestickSeries.current?.update(lastCandlestick)

        renderRealtimePriceLine({price: lastCandlestick, volume: {} as HistogramData<Time>})
    }

    const onCrosshairMove = (param:MouseEventParams) => {
        // 1 bar can consist of several pixles, and this handler will be called on every pixle move. 
        // we use sourceEvent to reduce number of execution
        if (param.sourceEvent) {
            const data = param.seriesData.get(candlestickSeries.current!) as CandlestickData<Time> 
            if(topOverlayContainer) {
                topOverlayContainer.current?.updateQuote(data)
            }
        }
    }

    const onChartDoubleClick = (event:MouseEventParams) => {
        if(event.time && paramState.current) {
            const currentTimeframe = hookConfig.timeframeOptions[paramState.current.resolution]
            let nextTimeframeOrder = currentTimeframe.order

            if(event.sourceEvent?.altKey) {
                nextTimeframeOrder = (currentTimeframe.order < Object.keys(hookConfig.timeframeOptions).length) ? currentTimeframe.order + 1 : currentTimeframe.order
            }
            else {
                nextTimeframeOrder = (currentTimeframe.order > 1) ? currentTimeframe.order - 1 : currentTimeframe.order
            }

            const nextTimeframe = Object.entries(hookConfig.timeframeOptions).find(a => a[1].order == nextTimeframeOrder)
            if(nextTimeframe) {
                const barCount = nextTimeframe[1].unix * nextTimeframe[1].countback
                const fetchFrom = event.time as number - barCount
                const fetchTo = event.time as number + barCount
                paramState.current = {...paramState.current, resolution: nextTimeframe[0], from: fetchFrom as Time, to: fetchTo as Time}

                const visibleBarCount = nextTimeframe[1].unix * 110
                const visibleFrom = event.time as number - visibleBarCount
                const visibleTo = event.time as number + visibleBarCount
                
                //console.log(`${new Date(1000*visibleFrom)} - ${new Date(1000*(event.time as number))} - ${new Date(1000*visibleTo)}`)
                refreshChart({from: visibleFrom as Time, to: visibleTo as Time})
                onStateChanged(paramState.current)
            }
        }
    }
    
    const initializePlugins = () => {
        if (candlestickSeries.current) {
            // user alert        
            const userPriceAlertsPrimitive = new UserPriceAlerts();       
            userPriceAlertsPrimitive.alertAdded().subscribe((alertInfo: UserAlertInfo) => {appContext.Alert.insert(hookConfig.websocketSymbolMapping[paramState.current.symbol], alertInfo)});
            userPriceAlertsPrimitive.alertRemoved().subscribe((id: string) => {appContext.Alert.deleteById(hookConfig.websocketSymbolMapping[paramState.current.symbol], id)});
            candlestickSeries.current.attachPrimitive(userPriceAlertsPrimitive);
            customPrimitiveMap.current.set(CustomPrimitiveType.Alert, userPriceAlertsPrimitive)     
        }
    }

    const updatePlugins = () => {
        if (candlestickSeries.current) {
            // user alert        
            const alertPlugin = customPrimitiveMap.current.get(CustomPrimitiveType.Alert) as UserPriceAlerts
            if(alertPlugin && alertPlugin.getSymbolName() != paramState.current.symbol) {
                alertPlugin.setSymbolName(paramState.current.symbol)
                appContext.Alert.getListBySymbol(hookConfig.websocketSymbolMapping[paramState.current.symbol]).then(res => {
                    alertPlugin.initializeAlerts(res as UserAlertInfo[])
                })
            }
        }
    }

    const addRealtimeSubscription = () => {
        subscriptionManager.subscribeEvent(StreamEvent.RealTimeBar, realtimeBarHandler)
        subscriptionManager.subscribeEvent(StreamEvent.RealTimeSymbolQuote, realtimeQuoteHandler)
        topOverlayContainer.current?.updateRealtimeStatus(true)       
    }

    const removeRealtimeSubscription = () => {
        subscriptionManager.unsubscribeEvents([StreamEvent.RealTimeBar, StreamEvent.RealTimeSymbolQuote])
        topOverlayContainer.current?.updateRealtimeStatus(false)
    }

    const refreshChart = (visibleRange?: {from: Time, to: Time}) => {
        document.removeEventListener(chartContext.Stream.CONNECTED_EVENT_ID, addRealtimeSubscription)        
        removeRealtimeSubscription()    // disconnect realtime listeners first just in case the next selected timeframe is not realtime

        chartContext.Historical.getHistoricalData({...paramState.current}).then(res => {
            candlestickSeries.current?.setData(res.price)
            volumeSeries.current?.setData(res.volume)

            if(res.isLastBarRealtime) {
                if(chartContext.Stream.isConnected) {
                    addRealtimeSubscription()
                }
                else {
                    document.addEventListener(chartContext.Stream.CONNECTED_EVENT_ID, addRealtimeSubscription, { once: true })
                }
            }
            

            chart.current?.timeScale().resetTimeScale()
            chart.current?.priceScale('right').applyOptions({
                autoScale: true,
            });

            if(visibleRange) { // to center after zoom in           
                chart.current?.timeScale().setVisibleRange({ from: visibleRange.from, to: visibleRange.to })
            }

            updatePlugins()
            renderTradeData()
        })
    }

    const initializeChart = () => {
        chart.current = createChart(chartContainer.current, chartOptions)
        chart.current.applyOptions({ 
            width: chartContainer.current.parentElement?.clientWidth,
            height: 880
        });
        
        candlestickSeries.current = chart.current.addCandlestickSeries(candlestickOptions)
        candlestickSeries.current.priceScale().applyOptions({
            scaleMargins: {
                top: 0.05, // highest point of the series will be 70% away from the top
                bottom: 0.1,
            },
        });

        volumeSeries.current = chart.current.addHistogramSeries(volumeOptions)
        volumeSeries.current.priceScale().applyOptions({
            scaleMargins: {
                top: 0.7, // highest point of the series will be 70% away from the top
                bottom: 0,
            },
        });

        // chart.current.chartElement() will get removed together with the chart
        chart.current.chartElement().addEventListener('mouseup', debouncedMouseUp)
        chart.current.chartElement().addEventListener('OPEN_ALERT', openAlertDetail)
        window.addEventListener('resize', resizeChart);

        chart.current.subscribeCrosshairMove(onCrosshairMove)
        chart.current.subscribeDblClick(onChartDoubleClick)
        
        initializePlugins()

        refreshChart()
    }

    const resizeChart = () => {
        chart.current?.resize(window.innerWidth, window.innerHeight-50);
    }

    const disposeChart = () => {
        chart.current && chart.current?.remove()
        window.removeEventListener('resize', resizeChart);
    }

    const clearRealtimePriceLine = () => {
        realtimePriceLine.upperLine && candlestickSeries.current?.removePriceLine(realtimePriceLine.upperLine)
        realtimePriceLine.lowerLine && candlestickSeries.current?.removePriceLine(realtimePriceLine.lowerLine)
        realtimePriceLine.upperLine = undefined
        realtimePriceLine.lowerLine = undefined
    }

    const toogleRealtimePriceLine = (isEnabled: boolean, distance: number) => {
        if(isEnabled) {
            realtimePriceLine.distance = distance
        }
        else {
            realtimePriceLine.distance = 0
            clearRealtimePriceLine()
        }
    }

    const removeAllTradeLines = () => {
        //detach all trade line primitives from the chart
        const existingTradelines = customPrimitiveMap.current.get(CustomPrimitiveType.Trade) as ISeriesPrimitive<Time>[]
        if(existingTradelines && existingTradelines.length > 0) {
            existingTradelines.map(t => {
                candlestickSeries.current?.detachPrimitive(t)
            })
        }
        customPrimitiveMap.current.set(CustomPrimitiveType.Trade, [])
    }

    const renderTradeData = () => {
        if(userContext.Trade.tradeData && userContext.Trade.tradeData.length > 0) {
            const unixSubstractor = hookConfig.timeframeOptions[paramState.current.resolution].unix
            const tradeMarkers:SeriesMarker<Time>[] = []
            const tradeLinesPrimitives:ISeriesPrimitive<Time>[] = []

            removeAllTradeLines()

            const tradeBySymbol = userContext.Trade.tradeData.filter((a:TTrade) => a.symbolId == hookConfig.websocketSymbolMapping[paramState.current.symbol])                   
            tradeBySymbol.map((a:TTrade) => {
                const pnlBasedColor = a.pnL >= 0 ? '#00c40a' : '#ff3b0f'
                const adjEntryTime = (a.entryTime - a.entryTime % unixSubstractor) as Time
                const adjExitTime = (a.exitTime - a.exitTime % unixSubstractor) as Time

                tradeMarkers.push({
                    time: adjEntryTime,
                    position: (-a.positionSize) > 0 ? 'belowBar' : 'aboveBar',
                    color: pnlBasedColor,
                    shape: (-a.positionSize) > 0 ? 'arrowUp' : 'arrowDown',
                    //text: `${(-a.positionSize)} @ ${a.entryPrice}`,
                })
    
                // tradeMarkers.push({
                //     time: adjExitTime,
                //     position: a.positionSize > 0 ? 'belowBar' : 'aboveBar',
                //     color: pnlBasedColor,
                //     shape: a.positionSize > 0 ? 'arrowUp' : 'arrowDown',
                //     text: `${a.positionSize} @ ${a.exitPrice}`,
                // })
                
                // treade line
                const point1 = {
                    time: adjEntryTime,
                    price: a.entryPrice
                };
                const point2 = {
                    time: adjExitTime,
                    price: a.exitPrice
                };

                const tradeLine = new TradeLine(chart.current!, candlestickSeries.current!, point1, point2, { showLabels: false, lineColor: pnlBasedColor, width: 2});
                tradeLinesPrimitives.push(tradeLine)
                candlestickSeries.current!.attachPrimitive(tradeLine);
            })
    
            customPrimitiveMap.current.set(CustomPrimitiveType.Trade, tradeLinesPrimitives)
            candlestickSeries.current?.setMarkers(tradeMarkers.sort((a, b) => (a.time as number) - (b.time as number)))
        }
    }

    const toogleTradeReport = (accountId:number, isChecked:boolean) => {
        candlestickSeries.current?.setMarkers([])
        removeAllTradeLines()
        userContext.Trade.tradeData = []
        if(isChecked) {
            // Download trades for all symbols
            userContext.Trade.getAllByAccountId(accountId).then(() => {
                renderTradeData()
            })
        }
    }

    const refreshCustomSeries = () => {
        customSeriesMap.forEach((customSeries:TCustomSeriesApi<CustomData>, _:CustomSeriesType) => {
            if(customSeries.symbol != paramState.current.symbol) {
                customSeries.symbol = paramState.current.symbol
                customSeries.series.setData([])
            }
        })   
    }

    const updateState = (state: TDataConfig) => {
        if(paramState.current) {
            paramState.current = state
            refreshChart()
            refreshCustomSeries()
            clearRealtimePriceLine()
        }
    }

    const updateAlert = (id: string, price: number) => {
        const alertPlugin = customPrimitiveMap.current.get(CustomPrimitiveType.Alert) as UserPriceAlerts
        alertPlugin.updateAlert({id: id, price: price})
        chart.current?.applyOptions({})
    }

    const updateLevels = async (selectedValues: Map<string, TLevelDetail>) => {
        const existingLevels:IPriceLine[] = customPrimitiveMap.current.get(CustomPrimitiveType.Levels) as IPriceLine[]
        if(existingLevels) {
            existingLevels.forEach(item => {
                candlestickSeries.current!.removePriceLine(item)
            });
            customPrimitiveMap.current.set(CustomPrimitiveType.Levels, [])
        }

        if(selectedValues.size > 0) {
            const dbResult = await appContext.Level.getByAuthors(paramState.current.symbol.replace("M", ""), Array.from(selectedValues.keys()))
            const levelPrimitives:IPriceLine[] = []
            if(dbResult && dbResult.length > 0) {
                dbResult.forEach(level => {
                    levelPrimitives.push(candlestickSeries.current!.createPriceLine({
                        price: level.price,
                        title: level.detail,
                        color: selectedValues.get(level.author)?.color,
                        lineWidth: 1,
                        lineStyle: LineStyle.Dotted
                    }))
                })
                customPrimitiveMap.current.set(CustomPrimitiveType.Levels, levelPrimitives)
            }
        }
    }

    const realtimeTiltHandler = (data: Event) => {
        const dataDetail:TiltJson[] = (data as CustomEvent<TiltJson[]>).detail

        const tiltData = dataDetail.find(a => a.contractName.startsWith(paramState.current.symbol))
        if(tiltData) {
            const tiltTimestamp = Math.round((Date.now() / 1000)) as UTCTimestamp
            const longSeries = customSeriesMap.get(CustomSeriesType.TiltLong)?.series as ISeriesApi<"Custom", Time, TiltData>
            longSeries.update({avgPrice: tiltData.avgPriceLong, bias: tiltData.longBias, time: tiltTimestamp})                
            longSeries.applyOptions({title: tiltData.longBias.toFixed(2)})            
            const shortSeries = customSeriesMap.get(CustomSeriesType.TiltShort)?.series as ISeriesApi<"Custom", Time, TiltData>
            shortSeries.update({avgPrice: tiltData.avgPriceShort, bias: tiltData.shortBias, time: tiltTimestamp})                
            shortSeries.applyOptions({title: tiltData.shortBias.toFixed(2)})            
        }
    }

    const toogleTilt = (isChecked:boolean) => {
        if(isChecked) {
            const longSeries = chart.current?.addCustomSeries(new TiltSeries(), {lineWidth: 1, lineColor: 'rgba(0, 255, 0, 1)', areaColor: 'rgba(0, 255, 0, 0.2)', bandScale: 1}) as ISeriesApi<"Custom", Time, TiltData, TiltSeriesOptions>
            longSeries?.applyOptions({priceLineColor: longSeries?.options().lineColor})
            customSeriesMap.set(CustomSeriesType.TiltLong, {symbol: paramState.current.symbol, series: longSeries})
            
            const shortSeries = chart.current?.addCustomSeries(new TiltSeries(), {lineWidth: 1, lineColor: 'rgba(255, 0, 0, 1)', areaColor: 'rgba(255, 0, 0, 0.2)', bandScale: 1}) as ISeriesApi<"Custom", Time, TiltData, TiltSeriesOptions>
            shortSeries?.applyOptions({priceLineColor: shortSeries?.options().lineColor})
            customSeriesMap.set(CustomSeriesType.TiltShort, {symbol: paramState.current.symbol, series: shortSeries})

            subscriptionManager.subscribeEvent(StreamEvent.RealTimeTilt, realtimeTiltHandler)
        }
        else {
            chart.current?.removeSeries(customSeriesMap.get(CustomSeriesType.TiltLong)?.series as ISeriesApi<"Custom", Time, CustomData>)
            customSeriesMap.delete(CustomSeriesType.TiltLong)
            chart.current?.removeSeries(customSeriesMap.get(CustomSeriesType.TiltShort)?.series as ISeriesApi<"Custom", Time, CustomData>)
            customSeriesMap.delete(CustomSeriesType.TiltShort)
            subscriptionManager.unsubscribeEvents([StreamEvent.RealTimeTilt])
        }
    }

    const toogleShadowOrder = (isChecked:boolean) => {
        if(isChecked) {
            userContext.Position.getByUserId(Number(localStorage.getItem('topstep.userId') ?? 0)).then((positions: TPositionJson[]) => {
                if(positions.length > 0) {
                    const match:TPositionJson|undefined = positions.find(x => x.symbolName.replace("/", "") == paramState.current.symbol)
                    if(match) { 
                        shadowOrderDialogRef.current?.updateState({visible: true, size: match.positionSize, stop: match.risk})
                        const shadowOrder = new ShadowOrder({actualPosition: {...match}, shadowPosition: {...match}, contractCost: hookConfig.symbolMetadata[hookConfig.websocketSymbolMapping[paramState.current.symbol]].contractCost}, {})
                        candlestickSeries.current?.attachPrimitive(shadowOrder)
                        customPrimitiveMap.current.set(CustomPrimitiveType.ShadowOrder, shadowOrder)
                    }
                }
            })
        }
        else {
            shadowOrderDialogRef.current?.updateState({visible: false, size: 0, stop: 0})
            const shadowOrder = customPrimitiveMap.current.get(CustomPrimitiveType.ShadowOrder) as ShadowOrder
            if(shadowOrder) {
                shadowOrder.forceUpdate() //trigger requestUpdate()
                candlestickSeries.current?.detachPrimitive(shadowOrder)
                customPrimitiveMap.current.delete(CustomPrimitiveType.ShadowOrder)
            }
        }
    }

    const updateShadowOrder = (size: number, stop: number) => {
        const shadowOrder = customPrimitiveMap.current.get(CustomPrimitiveType.ShadowOrder) as ShadowOrder
        shadowOrder.updateShadowOrder(size, stop)
    }

    return {
        updateState,
        toogleRealtimePriceLine,
        updateAlert,
        toogleTradeReport,
        updateLevels,
        initializeChart,
        disposeChart,
        toogleTilt,
        toogleShadowOrder,
        updateShadowOrder
    }
}

export default useChart