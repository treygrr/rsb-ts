import fetch from 'node-fetch';

interface SearchData {
    data: any;
    errors: boolean;
    errorMessages: string[];
}

export class SearchById {
    id: string;
    osrs: boolean;
    searchData: SearchData = {
        data: {},
        errors: false,
        errorMessages: [],
    };
    constructor(id: string, osrs: boolean) {
        if (!id) {
            console.log('No item id provided');
        }
        this.osrs = osrs;
        this.id = id;
    }
    async getItemData() {
        try {
            const request = await fetch(`https://services.runescape.com/m=${this.osrs ? 'itemdb_oldschool' : 'itemdb_rs'}/api/catalogue/detail.json?item=${this.id}`);
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