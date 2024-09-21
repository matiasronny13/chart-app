import { MenuItem, SelectChangeEvent, Typography } from "@mui/material"
import { StyledSelect } from "./StyledSelect"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { TAccount } from "../shared/types"
import { useUserContext } from "../contexts/UserContextProvider"

type TProps = {
    accountChanged: (selectedAccount:number) => void
}

export type TAccountSelectRef = {
    currentSelectedAccount: () => number
}

type TDbAccount = {
    id: number
    name: string
    accountType: number
}

const AccountSelect = forwardRef<TAccountSelectRef, TProps>(({accountChanged}, ref) => {
    const userContext = useUserContext()
    const [accounts, setAccounts] = useState<TAccount[]>([])
    
    const onAccountChanged = (event:SelectChangeEvent<unknown>) => {
        const selected = Number(event.target.value)
        userContext.Account.selectedAccount = selected
        accountChanged(selected)
    }

    useEffect(() => {
        userContext.Account.getAll().then((a) => {
            const accs = a as TDbAccount[]
            setAccounts(accs.map((x:TDbAccount) => ({accountId: x.id, accountName: x.name, accountType: x.accountType} as TAccount)))
        })
    }, [])

    useImperativeHandle(ref, () => ({
            currentSelectedAccount: () => userContext.Account.selectedAccount
        })
    )

    return (<StyledSelect variant="standard" margin="none" value={userContext.Account.selectedAccount} onChange={onAccountChanged} sx={{width:120}}>
        {
            accounts.map(item => <MenuItem key={item.accountId} value={item.accountId}>
                <Typography noWrap
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                  color: (item.accountType == 1) ? "#ff8785" : "#47ff79"
                }}>{item.accountName}</Typography></MenuItem>)
        }
    </StyledSelect>)
})

export default AccountSelect;