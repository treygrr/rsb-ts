import fetch from 'node-fetch';

interface SearchData {
    data: any;
    errors: boolean;
    errorMessages: string[];
}

export class SearchById {
    id: string;
    searchData: SearchData = {
        data: {},
        errors: false,
        errorMessages: [],
    };
    constructor(id: string) {
        if (!id) {
            throw new Error('No item id provided');
        }
        this.id = id;
    }
    async getItemData() {
        try {
            const request = await fetch(`https://services.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item=${this.id}`);
            this.searchData.data = await request.json();
            // TODO: save this data to a file if it is a meaningful result
            return this.searchData.data;
        } catch (error: any) {
            console.log(error);
            this.searchData.errors = true;
            this.searchData.errorMessages.push(error);
        }
    }
}