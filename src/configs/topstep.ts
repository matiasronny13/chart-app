import { Time } from "lightweight-charts";
import { TKeyValueString } from "../shared/types";

export const symbolFilter = ["F.US.ENQ", "F.US.MNQ", "F.US.EP", "F.US.MES", "F.US.GCE", "F.US.MGC", "F.US.CLE", "F.US.MCLE"];

export const websocketSymbolMapping: TKeyValueString = {
    NQ: "F.US.ENQ",
    MNQ: "F.US.MNQ",
    ES: "F.US.EP",
    MES: "F.US.MES",
    GC: "F.US.GCE",
    MGC: "F.US.MGC",
    CL: "F.US.CLE",
    MCL: "F.US.MCLE"
};

export const timeframeOptions: {[key: string]: {order:number, label:string, unix: number, realtimeEnabled: boolean, countback: number}} = {
    "15S":  { order:1, label:"15s", unix:15, realtimeEnabled: true, countback: 300 },
    "1":    { order:2, label:"1m", unix:60, realtimeEnabled: true, countback: 300 },
    "5":    { order:3, label:"5m", unix:300, realtimeEnabled: true, countback: 300 },
    "15":   { order:4, label:"15m", unix:900, realtimeEnabled: true, countback: 300 },
    "30":   { order:5, label:"30m", unix:1800, realtimeEnabled: true, countback: 300 },
    "60":   { order:6, label:"1h", unix:3600, realtimeEnabled: true, countback: 300 },
    "240":  { order:7, label:"4h", unix:14400, realtimeEnabled: false, countback: 900 },
    "1D":   { order:8, label:"1d", unix:86400, realtimeEnabled: false, countback: 300 },
    "1W":   { order:9, label:"1w", unix:604800, realtimeEnabled: false, countback: 300 }
}

export const defaultParam = { symbol: "MNQ", resolution: "1", from: Math.round(Date.now() / 1000) as Time, to: Math.round(Date.now() / 1000) as Time }
