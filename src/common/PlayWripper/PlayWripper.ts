import { Page, chromium, BrowserContext } from '@playwright/test';
const chrome = await chromium.launch({ headless: false, args: ['--start-maximized', '--no-sandbox'] });
const context = await chrome.newContext();
const page = await context.newPage();
page.goto('https://www.twitter.com');

export default class PlayWripper {
  public browser: BrowserContext = context;

  async openTab(url?: string): Promise<Page> {
      const page = await this.browser.newPage();
      if (url) await page.goto(url);
      return page;
  }

  async goTo(page: Page, url: string) {
    try {
      await page.goto(url);
    } catch (e) {
      console.log(e);
    }
  }

  async closeTab(page: Page) {
    try {
      await page.close();
    } catch (e) {
      console.log(e);
    }
  }
}