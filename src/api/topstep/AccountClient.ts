export class AccountClient {
    constructor() { }

    get selectedAccount(): number {
        return Number(localStorage.getItem('topstep.selectedAccount') ?? 0)
    }

    set selectedAccount(accountId: number) {
        localStorage.setItem('topstep.selectedAccount', accountId.toString())
    }

    async getAll():Promise<unknown[]> {
        const response = await fetch("http://localhost/api/topstep/accounts",
            {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )

        if(response.status == 200) {
            return await response.json()
        }

        return [];
    }
}