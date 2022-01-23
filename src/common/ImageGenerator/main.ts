import { ItemData } from "../../Interfaces/SearchInterfaces.js";
import GrandExchangeSearch from "../GrandExchangeSearch/GrandExchangeSearch.js";
import PlayWripper from "../PlayWripper/PlayWripper.js";
import ImageGenerator from "./ImageGenerator.js";
const browser = new PlayWripper();

const itemData: ItemData = {
  image: 'https://i.imgur.com/Z5XQZQW.png',
  name: 'Dragon',
  id: '12345',
  members: true,
  price: '$1.00',
  change: '+1.00',
}

const searchResults = await data.search({ searchQuery: 'dragon sword', disableAll: true });
if (searchResults) {
  await image.generateImage();
}

