import fetch from 'node-fetch';
import { HistoryResults } from '../../Interfaces/HBSInterfaces';

export class SearchById {
    id: string;
    osrs: boolean;
    constructor(id: string, osrs: boolean) {
        if (!id) {
            console.log('No item id provided');
        }
        this.osrs = osrs;
        this.id = id;
    }
    async getItemData(): Promise<HistoryResults> {
        try {
            const itemRequest = await fetch(`https://services.runescape.com/m=${this.osrs ? 'itemdb_oldschool' : 'itemdb_rs'}/api/catalogue/detail.json?item=${this.id}`);
            const graphRequest = await fetch(`https://services.runescape.com/m=${this.osrs ? 'itemdb_oldschool' : 'itemdb_rs'}/api/graph/${this.id}.json`);
            const history = await itemRequest.json();
            const graph = await graphRequest.json();
            // TODO: save this data to a file if it is a meaningful result
            return {
                graph,
                data: { ...history.item },
                errors: false,
                errorMessages: [],
            };
        } catch (error: any) {
            return {
                errors: true,
                errorMessages: [error],
            };
        }
    }
}