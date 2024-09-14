import { TTrade } from "../../shared/types";

export class TradeClient {
    private readonly _token:string    
    private _tradeData:TTrade[]|null = null

    constructor(token: string) { 
        this._token = token
    }

    get tradeData() {
        return this._tradeData
    }

    async getAllByAccountId(accountId:number):Promise<unknown[]> {
        const url = `https://userapi.topstepx.com/Trade/id/${accountId}`
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${this._token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonData = await response.json();
        if(jsonData) {
            this._tradeData = []
            return jsonData.map((a:TTrade) => {
                this._tradeData?.push({...a, entryTime: Math.floor(new Date(a.createdAt).getTime()/1000), exitTime: Math.floor(new Date(a.exitedAt).getTime()/1000)})
            })
        }
        return []
    }
}