import { TPositionJson } from "../../shared/types";

export class PositionClient {
    private readonly _token:string

    constructor(token: string) { 
        this._token = token
    }

    async getByUserId(userId: number): Promise<TPositionJson[]> {
        const response = await fetch(`https://userapi.topstepx.com/Position/all/user/${userId}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${this._token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json() as Promise<TPositionJson[]>;
    }
}