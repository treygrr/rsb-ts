import { ItemData } from "../../Interfaces/SearchInterfaces.js";
import GrandExchangeSearch from "../GrandExchangeSearch/GrandExchangeSearch.js";
import PlayWripper from "../PlayWripper/PlayWripper.js";
import ImageGenerator from "./ImageGenerator.js";
import { search } from "../PowerSearch/PowerSearch.js";
const browser = new PlayWripper();

const itemData: ItemData = {
  image: 'https://i.imgur.com/Z5XQZQW.png',
  name: 'Dragon',
  id: '12345',
  members: true,
  price: '$1.00',
  change: '+1.00',
}

const newStart = performance.now();
const data = new GrandExchangeSearch();
const searchResults = await data.search({ searchQuery: 'dragon sword', disableAll: true });
if (searchResults) {
  const image = new ImageGenerator(searchResults.matchedResults[0], 'Test');
  await image.generateImage();
}
const newEnd = performance.now();
// console log the time to generate in seconds
console.log(`Time to generate same result on new system: ${(newEnd - newStart) / 1000} seconds`);

const oldStart = performance.now();
await search('dragon sword');
const oldEnd = performance.now();
// console log the time to generate in seconds
console.log(`Time to generate same result on old system: ${(oldEnd - oldStart) / 1000} seconds`);




