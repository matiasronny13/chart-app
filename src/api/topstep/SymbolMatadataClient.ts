import hookConfig from "../../configs/appConfig";
import { symbolFilter } from "../../configs/topstep";
import { TSymbolMetadata } from "../../shared/types";

export class SymbolMetadataClient {
    constructor() { 
        this.getSymbolMetadata().then((metadata) => {
            hookConfig.symbolMetadata = {};
            metadata.map((item) => {
                if(symbolFilter.includes(item.symbol))
                {
                    hookConfig.symbolMetadata[item.symbol] = item;
                }
            });
        })
    }

    async getSymbolMetadata():Promise<TSymbolMetadata[]> {
        const response = await fetch("https://userapi.topstepx.com/Metadata", {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
        if(!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    }
}