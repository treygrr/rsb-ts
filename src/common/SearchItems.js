import CategoryList from '../runescape/CategoryList.js';

export default class SearchItems {
    
    constructor(itemName) {
        if(!itemName) {
            throw new Error('No item name provided');
        }
        this.itemName = itemName;
    }

    async getItem() {
        const request = await fetch(`https://services.runescape.com/m=itemdb_rs/api/catalogue/items.json?category=X&alpha=Y&page=Z`);
    }

}