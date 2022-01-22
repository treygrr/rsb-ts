import { ChromiumBrowser, expect, Locator, Page, chromium, BrowserContext } from '@playwright/test';
import Handlebars from 'handlebars';
import PlayWripper from '../PlayWripper/PlayWripper.js';

export default class ImageGenerator extends PlayWripper {
  private page?: Page;
  constructor() {
    super();
    this.init();

  }

  async init () {
    this.page = await this.browser.newPage();
    await this.page.setContent('<p>Hello</p>');
  }
}