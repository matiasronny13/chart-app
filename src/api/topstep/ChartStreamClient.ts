import { Time } from "lightweight-charts";
import { getBarColor } from "../../shared/utils";
import { SubscriptionInfo } from "../../hooks/SubscriptionManager";
import { StreamEvent } from "../../shared/constants";


export default class ChartStreamClient {
    private readonly _token:string
    private _ws: WebSocket
    private _realtimeInstrumentPool: Map<string, Set<string>>

    private _subscriptionMethods = {
        [StreamEvent.RealTimeBar]: {
            subscribe: (symbol: string, resolution: string) => (`{"arguments":["${symbol}","${resolution}"],"invocationId":"1","target":"SubscribeBars","type":1}\x1E`),
            unsubscribe: (symbol: string, resolution: string) => (`{"arguments":["${symbol}","${resolution}"],"invocationId":"1","target":"UnsubscribeBars","type":1}\x1E`)
        },
        [StreamEvent.RealTimeSymbolQuote]: {
            subscribe: (symbol: string) => (`{"arguments":["${symbol}",1],"invocationId":"0","target":"SubscribeQuotesForSymbolWithSpeed","type":1}\x1E`),
            unsubscribe: (symbol: string) => (`{"arguments":["${symbol}"],"invocationId":"0","target":"UnsubscribeQuote","type":1}\x1E`)
        },
        [StreamEvent.RealTimeTradeLog]: {
            subscribe: (symbol: string) => (`{"arguments":["${symbol}",1],"invocationId":"0","target":"SubscribeTradeLogWithSpeed","type":1}\x1E`),
            unsubscribe: (symbol: string) => (`{"arguments":["${symbol}"],"invocationId":"0","target":"UnsubscribeTradeLog","type":1}\x1E`)
        },
        [StreamEvent.RealTimeTilt]: {
            subscribe: () => (`{"arguments":[],"target":"SubscribeTilt","type":1}\x1E`),
            unsubscribe: () => (`{"arguments":[],"target":"UnsubscribeTilt","type":1}\x1E`),
        },
    };

    CONNECTED_EVENT_ID:string = "SOCKET_CONNECTED"

    get isConnected():boolean {
        return this._ws.readyState == WebSocket.OPEN
    }
    
    public getEventId = (eventType:StreamEvent, symbol?: string, resolution?: string) => {
        switch(eventType) {
            case StreamEvent.RealTimeBar:
                return `${StreamEvent[eventType]}_${symbol}_${resolution}`
            case StreamEvent.RealTimeSymbolQuote:
            case StreamEvent.RealTimeTradeLog:
                return `${StreamEvent[eventType]}_${symbol}`
            case StreamEvent.RealTimeTilt:
                return `${StreamEvent[eventType]}`
        }
    }

    constructor(token: string) { 
        this._token = token
        this._realtimeInstrumentPool = new Map<string, Set<string>>()
        this._ws = new WebSocket(`wss://chartapi.topstepx.com/hubs/chart?access_token=${this._token}`);
        this._ws.onopen = () => {
            if(this._ws.readyState == WebSocket.OPEN) {
                console.log('WebSocket connected');
                this._ws.send('{"protocol":"json","version":1}\x1E');
                document.dispatchEvent(new Event(this.CONNECTED_EVENT_ID))
            }
        };
    
        this._ws.onmessage = (event) => {
            //console.log(event.data)
            if (event.data == '{}\x1E') {
                this._ws.send('{"type":6}\x1E')
            }
            else if (event.data == '{"type":6}\x1E') {
                setTimeout(() => { this._ws.send('{"type":6}\x1E')}, 10000)
                //console.log('send {"type":6}\x1E')
            }
            else {
                const split = event.data.split('\x1E')
                if (split.length > 0) {
                    split.map((d:string) => {
                        if(d != "") {
                            const data = JSON.parse(d)
                            if(data.target == 'RealTimeBar') {
                                const bar = data.arguments[2]
                                 
                                const time = new Date(bar.timestamp).getTime() / 1000 as Time
    
                                const result = {
                                    price: {time: time, open: bar.open, high: bar.high, low: bar.low, close: bar.close},
                                    volume: {time: time, value: bar.volume,  color: getBarColor(bar.open, bar.close)}
                                }
                                
                                document.dispatchEvent(new CustomEvent(this.getEventId(StreamEvent.RealTimeBar, data.arguments[0], data.arguments[1]), {detail: result}))
                            }
                            else if(data.target == 'RealTimeSymbolQuote') {
                                const quote = data.arguments[0]
                                if("lastPrice" in quote) {
                                    document.dispatchEvent(new CustomEvent(this.getEventId(StreamEvent.RealTimeSymbolQuote, quote.symbol), {detail: {lastPrice: quote.lastPrice}}))
                                }
                            }
                            else if(data.target == 'RealTimeTradeLogWithSpeed') {
                                if(data.arguments.length > 1) {
                                    document.dispatchEvent(new CustomEvent(this.getEventId(StreamEvent.RealTimeTradeLog, data.arguments[0]), {detail: {lastPrice: data.arguments[1]}}))
                                }
                            }
                            else if(data.target == 'RealTimeTilt') {
                                if(data.arguments[0].length > 0) {
                                    document.dispatchEvent(new CustomEvent(this.getEventId(StreamEvent.RealTimeTilt), {detail: data.arguments[0]}))
                                }
                            }
                        }
                    })
                }
            }            
        };
    
        this._ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    
        this._ws.onclose = () => {
            console.log('WebSocket closed');
        };
    }

    public removeSubscription(eventType:StreamEvent, managerId:string, data: SubscriptionInfo) {
        const instrument = this._realtimeInstrumentPool.get(data.eventId)
        if(instrument) {
            instrument.delete(managerId)
                    
            if (instrument.size == 0) {
                this._realtimeInstrumentPool.delete(data.eventId)
                
                if(this._ws.readyState == WebSocket.OPEN) {
                    this._ws.send(this._subscriptionMethods[eventType].unsubscribe(data.symbol, data.resolution))
                }
            }
        }
    }

    public updateSubscription(eventType:StreamEvent, managerId:string, data: SubscriptionInfo) {        
        if(!this._realtimeInstrumentPool.has(data.eventId)) {
            this._ws.send(this._subscriptionMethods[eventType].subscribe(data.symbol, data.resolution))
            this._realtimeInstrumentPool.set(data.eventId, new Set<string>())
        }
        this._realtimeInstrumentPool.get(data.eventId)?.add(managerId)
    }
}