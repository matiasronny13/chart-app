export class AccountClient {
    constructor() { }

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