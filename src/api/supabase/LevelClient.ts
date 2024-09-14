import { SupabaseClient } from "@supabase/supabase-js";

export class LevelClient {

    private _supabase: SupabaseClient

    constructor(supabaseClient:SupabaseClient) {
        this._supabase = supabaseClient
    }

    async getByAuthors(symbol:string, authors:string[]) {
        try {
            const {data} = await this._supabase.from('levels').select().in('author', authors).eq('symbol', symbol)
            return data
        }
        catch(ex) {
            console.log(ex)
        }
    }
}