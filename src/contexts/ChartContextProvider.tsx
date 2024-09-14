import { createContext, useContext } from "react";
import { IContextProps } from "../shared/interfaces";
import { ChartClient } from "../api/topstep/ChartClient";
import ChartStreamClient from "../api/topstep/ChartStreamClient";

export interface IChartContext {
    Historical: ChartClient
    Stream: ChartStreamClient
}

const ChartContext = createContext<IChartContext>({} as IChartContext);

export const useChartContext = () => useContext<IChartContext>(ChartContext);

const authToken = localStorage.getItem('topstep.token') ?? ""
const contextValue:IChartContext = {
    Historical: new ChartClient(authToken),
    Stream: new ChartStreamClient(authToken)
} as IChartContext

const ChartContextProvider = ({ children }: IContextProps) => {
    return <ChartContext.Provider value={contextValue}>{children}</ChartContext.Provider>;
}

export default ChartContextProvider;