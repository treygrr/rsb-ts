import { ChromiumBrowser, expect, Locator, Page } from '@playwright/test';

export default class PlayWripper {
  browser: ChromiumBrowser;
  page?: Page;
  constructor(browser: ChromiumBrowser) {
    this.browser = browser;
  }

  async init() {
    try {
      this.page = await this.browser.newPage();
    } catch(e) {
      console.log(e);
    }
  }

  async goTo(url: string) {
    try {
      await this.page?.goto(url);
    } catch (e) {
      console.log(e);
    }
  }
}