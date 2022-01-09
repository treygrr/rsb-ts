import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import Handlebars from 'handlebars';
import fs from 'fs';

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

  const browser = await puppeteer.launch({ headless: false});
  const page = await browser.newPage();
  const log = console.log;

  await page.goto('https://secure.runescape.com/m=itemdb_rs/c=nqZaOLPp0aE/');
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
    console.log(`Page ${i} of ${data?.pageData?.totalPageNumber}`);
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
  }

  if (data.matchedResults?.length === 0 && data?.items?.length) {
    data.errors = true;
    data.errorMessages.push('No exact matches found');
  }

  console.log(data)
  if ( data.items ) {
    screenShotResults(browser, data.items);
  }
};

const goToNextPage =  async (page: any, pageNumber: number) => {
  await page.waitForNetworkIdle();
  await page.click(`#grandexchange > div > div.contents > main > div.content.roughTop > div > div > div > ul > li:nth-child(${pageNumber})`);
  await page.waitForNetworkIdle();
}

const getPageData = async function (page: any) {
  const trs = await page.evaluate(async () => {
    const totalPages = document.querySelectorAll('#grandexchange > div > div.contents > main > div.content.roughTop > div > div > div > ul > li');
    const currentPageNumber = document.querySelectorAll('#grandexchange > div > div.contents > main > div.content.roughTop > div > div > div > ul > li.current')[0];
    const data: PageData = {
      currentPage: parseInt(currentPageNumber.querySelectorAll('a')[0].innerText),
      totalPageNumber: totalPages.length,
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

const checkForMatches = (query: string, item: ItemData[]): ItemData[] => {
  const match = item.filter((item: any) => {
    return item.name.toLowerCase() === query.toLowerCase();
  });
  console.log('this is match count', match.length);
  return match;
}


const getHandleBarsTemplateFile = (): string => {
  return fs.readFileSync(`./ResultsTable.hbs`, 'utf8');
}

const getHandleBarsTemplateCompiled = (items: ItemData[]): any =>{
  return Handlebars.compile(getHandleBarsTemplateFile())(items);
}

const screenShotResults = async (browser: any, dataItems: ItemData[]) => {
  const page = await browser.newPage();
  await page.setContent(getHandleBarsTemplateCompiled(dataItems));
  const table = await page.$('table');
  await table?.screenshot({ path: 'table.png' });

}

search('dragon sword');