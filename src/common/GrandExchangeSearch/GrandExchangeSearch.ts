import { Page } from '@playwright/test';

import { DataReturn, ItemData, PageData } from '../../Interfaces/SearchInterfaces.js';

import PlayWripper from '../PlayWripper/PlayWripper.js';

export default class GrandExchangeSearch extends PlayWripper {
  page?: Page;
  searchQuery?: string;
  data: DataReturn;
  oldschool: Boolean;

  constructor(settings?: { oldschool?: boolean}) {
    super();
    this.data = {
      matchedResults: [],
      errors: false,
      errorMessages: [],
      pageData: {
        currentPage: 0,
        totalPageNumber: 0,
      },
    }

    if (settings?.oldschool) {
      this.oldschool = settings.oldschool;
    } else {
      this.oldschool = false;
    }
  }
  
  async search(searchSettings: { searchQuery?: string, disableAll?: boolean }): Promise<DataReturn> {
    if (!searchSettings) {
      this.data.errors = true;

      this.data.errorMessages.push('Search settings not provided');

      return this.data;
    }

    this.searchQuery = searchSettings.searchQuery;

    this.page = await this.browser.newPage();

    this.resourceDisabler(searchSettings.disableAll);

    await this.page?.goto(`https://secure.runescape.com/m=${this.oldschool? 'itemdb_oldschool' : 'itemdb_rs'}/results?query=${this.searchQuery}`);
    
    if (await this.findResults()) return this.data;

    if (await this.getPageData()) return this.data;

    if (await this.getDataFromPages()) return this.data;

    return this.data;
  }

  async close() {
    await this.page?.close();
  }

  private async doesSelectorExist (selector: string): Promise<boolean> {
    return await this.page?.$(selector)? true: false;
  }

  private async resourceDisabler(disableAll?: boolean) {
    if (!disableAll) return;

    if (disableAll) {
      await  this.page?.route('**/*', (route) => {
        const type = route.request().resourceType();
        (type === 'script' || type === 'image' || type === 'stylesheet') ? route.abort() : route.continue();
      });
    }
  }

  private async findResults() {
    const divCount = await this.doesSelectorExist('tbody');

    if (!divCount) {
      this.data.errors = true;
      this.data.errorMessages.push('No results found');
      this.close();
      return this.data;
    };

    return null
  }
  
  private async getPageData (): Promise<PageData | undefined> {
    try {
      const trs = await this.page?.evaluate(async () => {
        const totalPages = document.querySelectorAll('#grandexchange > div > div.contents > main > div.content.roughTop > div > div > div > ul > li:last-child')[0].querySelector('a')?.innerText?? '1';
  
        const currentPageNumber = document.querySelectorAll('#grandexchange > div > div.contents > main > div.content.roughTop > div > div > div > ul > li.current')[0];
  
        const pageData: PageData = {
          currentPage: parseInt(currentPageNumber.querySelectorAll('a')[0].innerText),
          totalPageNumber: parseInt(totalPages),
        }
  
        return pageData;
      });

      if (!trs) return undefined;

      this.data.pageData.currentPage = trs.currentPage;

      this.data.pageData.totalPageNumber = trs.totalPageNumber;

    } catch (error) {
      this.data.errors = true;

      this.data.errorMessages.push('Could not get pagination data');

      return undefined;
    }
  }
  private async getDataFromPages() {
    // for each page get data
    if (!this.data.pageData.currentPage && !this.data.pageData.totalPageNumber) {
      this.data.errors = true;

      this.data.errorMessages.push('An Error occured while scraping pagination data');

      return false;
    }
    for (let i = this.data?.pageData?.currentPage || 1; i <= (this.data?.pageData?.totalPageNumber || 1); i++) {
      await this.getTableData();
      // get pageData
      if (this.data?.pageData?.currentPage) {
        this.data.pageData.currentPage = i;
      }
      // if i = total page number break
      if (i === this.data?.pageData?.totalPageNumber) {
        break;
      }
      console.log(`Scraping page ${i} of ${this.data?.pageData?.totalPageNumber}`);
      await this.goToNextPage(i + 1);
      // go to next page
    }
  }

  private async getTableData(): Promise<Boolean> {
    await this.page?.waitForSelector('tbody > tr');
    try {
      const tableRows = await this.page?.evaluate(async () => {
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

      }) ?? [];

      this.data.matchedResults.push(...tableRows);

      return true;

    } catch (error) {
      console.log(error);

      this.data.errors = true;

      this.data.errorMessages.push('An Error occured while scraping table data');

      return false;
    }
  }

  private async goToNextPage (pageNumber: number) {
    const position = await this.page?.$$eval('#grandexchange > div > div.contents > main > div.content.roughTop > div > div > div > ul > li', (el: any, pageNumber: number) => {
      let stuff: any[] = [];

      el.forEach((e: any, i: number) => {
        stuff.push(el[i].innerText);
      });

      return stuff;

    }, pageNumber);

    if (!position) {
      this.data.errors = true;

      this.data.errorMessages.push('An Error occured while navigating to next page');

      return false;
    }

    const truePostition = position.findIndex((e) => {
      if (e === pageNumber.toString()) {
        return true;
      }
    });

    await this.page?.click(`#grandexchange > div > div.contents > main > div.content.roughTop > div > div > div > ul > li:nth-child(${truePostition + 1}) > a`);
  }
}