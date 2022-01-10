import fetch from 'node-fetch';

export class SearchById {
    id: string;
    constructor(id: string) {
        if (!id) {
            throw new Error('No user name provided');
        }
        this.id = id;
    }
    async getUserData() {
        try {
            const request = await fetch(`https://services.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item=${this.id}`);
            const data = await request.json();
            return data;
        } catch (error: any) {
            throw new Error(error);
        }
    }
}