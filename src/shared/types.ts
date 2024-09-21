import { CandlestickData, HistogramData, IPriceLine, ISeriesApi, Time } from "lightweight-charts";

export type TSocketSubscription = {    
    id: string
    symbol: string,
    resolution: string
    eventId: string    
}

export type TKeyValueString = {
    [key: string]: string;
};

export type TKeyValueSymbolMetadata = {
    [key: string]: TSymbolMetadata
};

export type TSymbolMetadata = {
    symbol: string
    friendlyName: string
    fullName: string
    description: string
    maturityMonthYear: string
    contractId: number
    tickSize: number
    tickValue: number
    contractCost: number
    fees: number
    marketGroupId: number
    decimalPlaces: number
    priceScale: number
    minMove: number
    fractionalPrice: boolean
    exchange: string
    minMove2: number
    disabled: boolean
}

export type TRealtimrPriceLine = {
    distance: number 
    upperLine: IPriceLine|undefined
    lowerLine: IPriceLine|undefined
}

export type TAccount = {
    accountId: number
    accountName: string
    accountType: number
    trades: TTrade[]
}

export type TTrade = {
    id: number,
    symbolId: string,
    accountId: number,
    createdAt: string,
    tradeDay: string,
    exitedAt: string,
    entryPrice: number,
    exitPrice: number,
    fees: number,
    pnL: number,
    positionSize: number,
    voided: boolean,
    entryTime:number,
    exitTime:number
}

export type TRealtimeEventData = {
    price: CandlestickData<Time>,
    volume: HistogramData<Time>
}

export type TRealtimeQuoteData = {
    lastPrice: number
}

export type TiltJson = {
    contractName: string
    avgPriceLong: number
    avgPriceShort: number
    longBias: number
    shortBias: number
}

export type TLevelDetail = {
    checked: boolean
    color: string
}

export type TDataConfig = {
    symbol: string
    resolution: string
    from: Time
    to: Time
}

export type TCustomSeriesApi<TData> = {
    symbol: string
    series: ISeriesApi<"Custom", Time, TData>
}

export type TPositionJson = {
    id: number
    symbolId: string
    symbolName: string
    positionSize: number
    stopLoss: number
    takeProfit: number
    toMake: number
    risk: number
    averagePrice: number
    profitAndLoss: number
    entryTime: string
    accountId: number
    stopLossOrderId: number
    takeProfitOrderId: number
    contractId: string
}
