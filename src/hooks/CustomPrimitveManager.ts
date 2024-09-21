import { ISeriesPrimitive, Time } from "lightweight-charts";

export enum PrimitiveType {
    ShadowOrder = 'ShadowOrder',
    TradeLine = 'TradeLine'
}

export default class CustomPrimitiveManager {
    private static _instance: CustomPrimitiveManager;
    private _primitives: Map<PrimitiveType, ISeriesPrimitive<Time>>;
    
    private constructor() {
        this._primitives = new Map<PrimitiveType, ISeriesPrimitive<Time>>();
    }

    public static getInstance(): CustomPrimitiveManager {
        if (!this._instance) {
            this._instance = new CustomPrimitiveManager();
        }   
        return this._instance;
    }

    public get primitives(): Map<PrimitiveType, ISeriesPrimitive<Time>> {
        return this._primitives;
    }
}