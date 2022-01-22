import { chromium } from "@playwright/test";


import PlayWripper from "./PlayWripper.js";

const chrome = await chromium.launch({ headless: false, args: ['--start-maximized', '--no-sandbox'] });
const browser = new PlayWripper(chrome);
await browser.init();

await browser.goTo('https://google.com');
console.log('I cry erytym');



