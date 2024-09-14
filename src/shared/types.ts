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
