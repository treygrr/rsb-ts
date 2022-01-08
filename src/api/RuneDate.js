export default class RuneDate {
    // calculate 
    constructor() {
        this.runeDate = getRuneDate();
    }

    // a method that retrieves the lastconfiguredupdate rune day
    async getLastConfiguredUpdate() {
        // fetch the url https://secure.runescape.com/m=itemdb_rs/api/info.json and return the last configured update
        // return the last configured update
        try {
            const response = await fetch('https://secure.runescape.com/m=itemdb_rs/api/info.json');
            const data = await response.json();
            return data.lastconfiguredupdate;
        }
        catch (error) {
            console.log(error);
        }
    }
}