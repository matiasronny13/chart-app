import { SupabaseClient } from "@supabase/supabase-js";
import { UserAlertInfo } from "../../plugins/user-price-alerts/state";

export class AlertClient {

    private _supabase: SupabaseClient
    private static readonly ALERT_CHANNEL_NAME:string = "alerts_channel"

    constructor(supabaseClient:SupabaseClient) {
        this._supabase = supabaseClient
    }

    async getListBySymbol(symbol: string) {
        try {
            const {data} = await this._supabase.from('alerts').select().eq('symbol', symbol)
            return data
        }
        catch(ex) {
            console.log(ex)
        }
    }

    async getById(id: string) {
        try {
            const {data} = await this._supabase.from('alerts').select().eq('id', id)
            return data
        }
        catch(ex) {
            console.log(ex)
        }
    }

    async deleteById(symbol: string, id: string) {
        try {
            await this._supabase.from('alerts').delete().eq('id', id)
            
            this._supabase.channel(AlertClient.ALERT_CHANNEL_NAME).send({
                type: 'broadcast',
                event: 'remove_alert',
                payload: { symbol: symbol,  id: id },
            })
        }
        catch(ex) {
            console.log(ex)
        }
    }

    async insert(symbol: string, alert: UserAlertInfo) {
        try {
            const {data} = await this._supabase.from('alerts').insert({...alert, symbol: symbol, price: Number(alert.price.toFixed(2))}).select('id')

            this._supabase.channel(AlertClient.ALERT_CHANNEL_NAME).send({
                type: 'broadcast',
                event: 'add_alert',
                payload: { symbol: symbol,  id: alert.id, price: Number(alert.price.toFixed(2)) },
            })

            return data
        }
        catch(ex) {
            console.log(ex)
        }
    }

    
    async update(symbol:string,  id: string, price: number, detail: string) {
        try {
            const {data} = await this._supabase.from('alerts').update({price: Number(price.toFixed(2)), detail: detail}).eq("id", id)
            
            this._supabase.channel(AlertClient.ALERT_CHANNEL_NAME).send({
                type: 'broadcast',
                event: 'update_alert',
                payload: { symbol: symbol,  id: id, price: Number(price.toFixed(2)), detail: detail },
            })

            return data
        }
        catch(ex) {
            console.log(ex)
        }
    }
}