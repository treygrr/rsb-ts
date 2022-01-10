import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import Handlebars from 'handlebars';
import fs from 'fs';
import { listenerCount } from 'process';

interface ItemData {
  image: string,
  name: string,
  id: string,
  members: boolean,
  price: string,
  change: string,
}

interface PageData {
  currentPage: number,
  totalPageNumber: number,
}

interface DataReturn {
  items?: ItemData[],
  exactMatch?: ItemData,
  matchedResults?: ItemData[],
  errors?: Boolean,
  errorMessages: string[],
  pageData?: PageData,
}

const search = async (query: string) => {

  const data: DataReturn = {
    items: [],
    errors: false,
    errorMessages: [],
    pageData: {
      currentPage: 0,
      totalPageNumber: 0,
    }
  }

  const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'], defaultViewport: null});
  const page = await browser.newPage();
  const log = console.log;

  await page.goto('https://secure.runescape.com/m=itemdb_rs/c=nqZaOLPp0aE/');
  // set viewport to fullsize desktop
  await page.screenshot({ path: 'example.png' });
  await page.waitForSelector('#CybotCookiebotDialogBodyButtonDecline'),
  await Promise.all([
    page.click('#CybotCookiebotDialogBodyButtonDecline')
  ]);

  deleteCookie(page);
  await page.waitForSelector('input[name=query]');
  await page.$eval('input[name=query]', (el: any, query: any): void => {
    return el.value = query.toLowerCase()
  }, query);
  await page.click('input.search-submit');
  await page.waitForNetworkIdle();
  const divCount = await doesSelectorExist(page, 'tbody');

  if (!divCount) {
    data.errors = true;
    data.errorMessages.push('No results found');
    console.log('No results found ... returning data and exiting session!');
    // await browser.close();
    return data;
  };
  
  const table = await page.$('#grandexchange > div > div.contents > main > div.content.roughTop > table > tbody');
  table?.screenshot({ path: 'table.png' });

  // check if there are multeple pages
    const pageData = await getPageData(page);
    data.pageData = pageData;

  // for each page get data
  for (let i = data?.pageData?.currentPage || 1; i <= (data?.pageData?.totalPageNumber || 1); i++) {
    // get data
    const trs = await getTableData(page);

    data.items?.push(...trs);
    // get pageData
    if (data?.pageData?.currentPage) {
      data.pageData.currentPage = i;
    }
    // if i = total page number break
    if (i === data?.pageData?.totalPageNumber) {
      break;
    }
    await goToNextPage(page, i + 1);
    // go to next page
  }

  // check for matches
  data.matchedResults = checkForMatches(query, data?.items ?? []);
  if (data.matchedResults?.length === 1) {
    data.exactMatch = data.matchedResults[0];
    console.log('Exact match found!', data.exactMatch.name);
    // await browser.close();
    return data;
  }

  if (data.matchedResults?.length === 0 && data?.items?.length) {
    screenShotResults(browser, data?.items);
    console.log('No exact match found, but results found!', data.items.length);
    // await browser.close();
    return data;
  }
};

const goToNextPage =  async (page: any, pageNumber: number) => {
  console.log('tring to go to page: ', pageNumber);
  await page.waitForNetworkIdle();
  await page.waitForTimeout(1000);
  const position = await page.$$eval('#grandexchange > div > div.contents > main > div.content.roughTop > div > div > div > ul > li', (el: any, pageNumber: number) => {
    let stuff: any[] = [];
    el.forEach((e: any, i: number) => {
      stuff.push(el[i].innerText);
    });
    return stuff;
  }, pageNumber);
  console.log('position', position);
  const truePostition = parseInt(position.findIndex((e: any) => parseInt(e) === pageNumber));
  console.log('truePostition: ', truePostition);
  await page.click(`#grandexchange > div > div.contents > main > div.content.roughTop > div > div > div > ul > li:nth-child(${truePostition + 1})`);
  await page.waitForNetworkIdle();
}

const getPageData = async function (page: any) {
  const trs = await page.evaluate(async () => {
    const totalPages = document.querySelectorAll('#grandexchange > div > div.contents > main > div.content.roughTop > div > div > div > ul > li:last-child')[0].querySelector('a')?.innerText?? '1';
    const currentPageNumber = document.querySelectorAll('#grandexchange > div > div.contents > main > div.content.roughTop > div > div > div > ul > li.current')[0];
    const data: PageData = {
      currentPage: parseInt(currentPageNumber.querySelectorAll('a')[0].innerText),
      totalPageNumber: parseInt(totalPages),
    }
    return data;
  });
  return trs;
};

const getTableData = async (page: any) => {
  const trs = await page.evaluate(async () => {
    let data: any[] = [];
    const elements = document.querySelectorAll('tbody > tr');
    for (let i = 0; i < elements.length; i++) {
      const child = Array.from(elements[i].children);
      const item = {
        image: child[0].querySelector('img')?.getAttribute('src'),
        name: child[0].querySelector('img')?.getAttribute('title'),
        id: child[0].querySelector('img')?.getAttribute('src')?.split('id=')[1],
        members: child[1].innerHTML.length ? true : false,
        price: child[2].querySelector('a')?.innerText,
        change: child[3].querySelector('a')?.innerText,
      }
      data.push(item);
    }
    return data;
  });
  return trs;
};

const deleteCookie = async (page: any) => {
  await page.waitForSelector('#CybotCookiebotDialog');
  await page.$eval('#CybotCookiebotDialog', (el: any) => el.style.display = 'none');
  await page.$eval('div#CybotCookiebotDialogBodyUnderlay', (el: any) => el.style.display = 'none');
}

const doesSelectorExist = async (page: any, selector: string): Promise<boolean> => {
  return await page.$(selector)? true: false;
}

const checkForMatches = (query: string, item: any): ItemData[] => {
  const match = item.filter((item: any) => {
    return item.name.toLowerCase() === query.toLowerCase();
  });
  return match;
}


const getHandleBarsTemplateFile = (): string => {
  return fs.readFileSync(`./src/api/PowerSearch/ResultsTable.hbs`, 'utf8');
}

const getHandleBarsTemplateCompiled = (items: any): any =>{
  return Handlebars.compile(getHandleBarsTemplateFile())(items);
}

const screenShotResults = async (browser: any, dataItems: any) => {
  const page = await browser.newPage();

  const build = {
    name: 'trey',
    items: { ...dataItems }
  }
  await page.setContent(getHandleBarsTemplateCompiled({ data: build.items }));
  const table = await page.$('body > div > div > table');
  // get height and width of element
  const { height, width } = await table.boundingBox();
  await page.screenshot({'path': 'choiceResult.png', 'clip': {'x': 0, 'y': 0, 'width': width, 'height': height } });  
  page.close();
}

export { search };