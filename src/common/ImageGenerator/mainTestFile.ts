import { ItemData } from "../../Interfaces/SearchInterfaces.js";
import GrandExchangeSearch from "../GrandExchangeSearch/GrandExchangeSearch.js";
import PlayWripper from "../PlayWripper/PlayWripper.js";
import ImageGenerator from "./ImageGenerator.js";
import { SearchById } from "../GrandExchangeSearch/SearchById.js";
const browser = new PlayWripper();

const itemData: ItemData = {
  image: 'https://i.imgur.com/Z5XQZQW.png',
  name: 'Dragon',
  id: '12345',
  members: true,
  price: '$1.00',
  change: '+1.00',
}

const data = new GrandExchangeSearch({ oldschool: false });

const searchResults = await data.search({ searchQuery: 'dragon', disableAll: true });

if (searchResults) {
  // const result = await new SearchById(searchResults.matchedResults[0].id, false).getItemData();
  const image = new ImageGenerator(searchResults, 'ResultsTable');
  await image.generateImage();
}

// when process.exit is called, the browser will close
process.on('exit', async () => {
  await browser.browser.close();
});