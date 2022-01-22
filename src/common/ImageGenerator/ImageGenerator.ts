import { ChromiumBrowser, expect, Locator, Page, chromium, BrowserContext } from '@playwright/test';
import Handlebars from 'handlebars';
import PlayWripper from '../PlayWripper/PlayWripper.js';
import fs from 'node:fs';
import hbsHelpers from '../HandlebarHelpers/index.js';
import { ItemData } from '../../Interfaces/SearchInterfaces.js';

export default class ImageGenerator extends PlayWripper {
  private page?: Page;
  private template: string;
  private hbsData: ItemData;
  private handlebars = Handlebars;

  constructor(data: ItemData, template: string) {
    super();
    this.hbsData = data;
    this.template = template;
    this.registerHelpers();
    this.init();
  }

  async init () {
    this.page = await this.browser.newPage();
    await this.page.setContent(this.compiledTemplate());
  }

  private registerHelpers() {
    // import all helpers
    hbsHelpers.forEach(helper => {
      helper(this.handlebars);
    });
  }

  private getTemplateFile = (): string => {
    return fs.readFileSync(`./src/common/HandlebarTemplates/${this.template}.hbs`, 'utf8');
  }

  private compiledTemplate = (): any => {
    return this.handlebars.compile(this.getTemplateFile())(this.hbsData);
  }

}