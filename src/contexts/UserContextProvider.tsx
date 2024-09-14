import { createContext, useContext } from "react";
import { IContextProps } from "../shared/interfaces";
import { TradeClient } from "../api/topstep/TradeClient";
import { AccountClient } from "../api/topstep/AccountClient";

export interface IUserContext {
    Account: AccountClient 
    Trade: TradeClient
}

const UserContext = createContext<IUserContext>({} as IUserContext);

export const useUserContext = () => useContext<IUserContext>(UserContext);

const contextValue:IUserContext = {
    Account: new AccountClient(),
    Trade: new TradeClient(localStorage.getItem('topstep.token') ?? "")
} as IUserContext

const UserContextProvider = ({ children }: IContextProps) => {
    return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}

export default UserContextProvider;