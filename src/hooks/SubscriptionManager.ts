import { v4 as uuidv4 } from 'uuid'
import ChartStreamClient from '../api/topstep/ChartStreamClient';
import { TDataConfig } from '../shared/types';
import { MutableRefObject } from 'react';
import hookConfig from '../configs/appConfig';
import { StreamEvent } from '../shared/constants';

type TEventCallback = (event:Event) => void

export class SubscriptionInfo {
    private _symbol:string
    private _resolution:string
    private _eventId:string
    private _callback:TEventCallback

    constructor(symbol:string, resolution:string, eventId:string, callback:TEventCallback) {
        this._symbol = symbol
        this._resolution = resolution
        this._eventId = eventId
        this._callback = callback
    }

    get symbol() { return this._symbol }
    get resolution() { return this._resolution }
    get eventId() { return this._eventId }
    get callback() { return this._callback }
}

export class SubscriptionManager {
    private _id:string
    private _chartParam:MutableRefObject<TDataConfig>
    private _subscriptions:Map<StreamEvent, SubscriptionInfo>;
    private _streamClient:ChartStreamClient
    
    constructor(chartParam:MutableRefObject<TDataConfig>, streamClient:ChartStreamClient) {
        this._chartParam = chartParam
        this._id = uuidv4()
        this._subscriptions = new Map()
        this._streamClient = streamClient
    }

    subscribeEvent(eventType:StreamEvent, callback:TEventCallback) {
        const realtimeSymbol = hookConfig.websocketSymbolMapping[this._chartParam.current.symbol]
        const eventId = this._streamClient.getEventId(eventType, realtimeSymbol, this._chartParam.current.resolution)
        const subscriptionInfo = new SubscriptionInfo(realtimeSymbol, this._chartParam.current.resolution, eventId, callback)
        
        this._subscriptions.set(eventType, subscriptionInfo)
        document.addEventListener(eventId, callback)
        this._streamClient.updateSubscription(eventType, this._id,subscriptionInfo)
    }
    
    unsubscribeEvent(eventType:StreamEvent, subscriptionInfo:SubscriptionInfo) {
        if(subscriptionInfo) {
            this._streamClient.removeSubscription(eventType, this._id, subscriptionInfo)
            document.removeEventListener(subscriptionInfo.eventId, subscriptionInfo.callback)
            this._subscriptions.delete(eventType)
        }
    }

    unsubscribeEvents(eventTypes?:StreamEvent[]) {
        if(!eventTypes) {
            Array.from(this._subscriptions.entries()).map(([event, subscriptionInfo]: [StreamEvent, SubscriptionInfo]) => {
                this.unsubscribeEvent(event, subscriptionInfo)
            })
        }
        else {
            eventTypes.forEach(event => {
                const subscriptionInfo = this._subscriptions.get(event)
                if(subscriptionInfo) {
                    this.unsubscribeEvent(event, subscriptionInfo)
                }
            })
        }
    }
}