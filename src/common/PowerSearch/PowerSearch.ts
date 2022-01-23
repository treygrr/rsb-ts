import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core'
import Handlebars from 'handlebars';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

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
  matchedResults: ItemData[],
  errors?: Boolean,
  errorMessages: string[],
  pageData?: PageData,
}

let searchTerm: string = '';

const search = async (query: string, os = false) => {
  searchTerm = query;
  const data: DataReturn = {
    matchedResults: [],
    errors: false,
    errorMessages: [],
    pageData: {
      currentPage: 0,
      totalPageNumber: 0,
    }
  }
  let browser;
  if (process.arch === 'arm64') {
    browser = await puppeteerCore.launch({ args: ['--start-maximized'], defaultViewport: null, executablePath: '/usr/bin/chromium-browser' });

  } else {
    browser = await puppeteer.launch({headless: process.env.MODE === "development" ? false : true, args: ['--start-maximized', '--no-sandbox'], defaultViewport: null });
  }
  try {
    const page = await browser.newPage();
    const log = console.log;
    if (os) {
      await page.goto('https://secure.runescape.com/m=itemdb_oldschool/c=HNhleE4TXj4/');
    } else {
      await page.goto('https://secure.runescape.com/m=itemdb_rs/c=nqZaOLPp0aE/');
    }
    // set viewport to fullsize desktop
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
    
    // check if there are multeple pages
    data.pageData = await getPageData(page);
    
    // for each page get data
    for (let i = data?.pageData?.currentPage || 1; i <= (data?.pageData?.totalPageNumber || 1); i++) {
      // get data
      const trs: ItemData[] = await getTableData(page);

      data.matchedResults.push(...trs);
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
    data.matchedResults = checkForMatches(query, data?.matchedResults ?? []);
    if (data.matchedResults?.length >= 1) {
      if (data.matchedResults.length === 1) {
        await screenShotResults(browser, data.matchedResults)
        data.matchedResults = data.matchedResults;
        await browser.close();
        return data;
      }
      await screenShotResults(browser, data.matchedResults)
      await browser.close();
      return data;
    }

    if (data.matchedResults?.length === 0 && data?.matchedResults?.length) {
      await screenShotResults(browser, data?.matchedResults);
      await browser.close();
      return data;
    }
  } catch (er: any) {
    data.errors = true;
    console.log(er);
    data.errorMessages.push('Something happened on the backend');
    data.errorMessages.push(er.toString());
    return data;
  }
};

const goToNextPage =  async (page: any, pageNumber: number) => {
  await page.waitForNetworkIdle();
  await page.waitForTimeout(1000);
  const position = await page.$$eval('#grandexchange > div > div.contents > main > div.content.roughTop > div > div > div > ul > li', (el: any, pageNumber: number) => {
    let stuff: any[] = [];
    el.forEach((e: any, i: number) => {
      stuff.push(el[i].innerText);
    });
    return stuff;
  }, pageNumber);
  const truePostition = parseInt(position.findIndex((e: any) => parseInt(e) === pageNumber));
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

const getTableData = async (page: any):Promise<ItemData[]> => {
  const trs: ItemData[] = await page.evaluate(async () => {
    let data: ItemData[] = [];
    const elements = document.querySelectorAll('tbody > tr');
    for (let i = 0; i < elements.length; i++) {
      const child = Array.from(elements[i].children);
      const item: ItemData = {
        image: child[0]?.querySelector('img')?.getAttribute('src') ?? '',
        name: child[0]?.querySelector('img')?.getAttribute('title') ?? '',
        id: child[0]?.querySelector('img')?.getAttribute('src')?.split('id=')[1] ?? '',
        members: child[1]?.innerHTML.length ? true : false,
        price: child[2]?.querySelector('a')?.innerText ?? '',
        change: child[3]?.querySelector('a')?.innerText ?? '',
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
  if (!match.length) {
    console.log('No matches was found.')
    return item;
  }
  return match;
}



const getHandleBarsTemplateFile = (): string => {
  return fs.readFileSync(`./src/api/PowerSearch/ResultsTable.hbs`, 'utf8');
}

const getHandleBarsTemplateCompiled = (items: any): any =>{
  Handlebars.registerHelper("isUp", function(value: string) {
    // if first letter in string is + then return green
    if (value.charAt(0) === '+') {
      return 'green';
    }
    if (value.charAt(0) === '-') {
      return 'red';
    }
    return 'black';
  });
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
  console.log('Saved a screenshot titled: ' + searchTerm + '.png');
  await page.screenshot({'path': `./src/itemDataBase/screenshots/${searchTerm}.png`, 'clip': {'x': 0, 'y': 0, 'width': width, 'height': height } });  
}

export { search };