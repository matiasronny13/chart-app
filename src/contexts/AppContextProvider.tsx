
import { createContext, useContext } from 'react';
import { IContextProps } from '../shared/interfaces';
import { AlertClient } from '../api/supabase/AlertClient';
import { LevelClient } from '../api/supabase/LevelClient';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseCredential } from '../credentials/supabase';

export type IAppContext = {
    Alert: AlertClient
    Level: LevelClient
}

const AppContext = createContext<IAppContext>({} as IAppContext);

export const useAppContext = () => useContext<IAppContext>(AppContext);

const supabaseClient: SupabaseClient = createClient(SupabaseCredential.URL, SupabaseCredential.ANON_KEY)
const contextValue:IAppContext = {
    Alert: new AlertClient(supabaseClient),
    Level: new LevelClient(supabaseClient)
}

const AppContextProvider: React.FC<IContextProps> = ({ children }) => {
    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;