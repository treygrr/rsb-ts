import { Page } from '@playwright/test';
import Handlebars from 'handlebars';
import { MessageAttachment } from 'discord.js';
import fs from 'node:fs';

import { DataReturn, ItemData } from '../../Interfaces/SearchInterfaces.js';
import { HistoryResults } from '../../Interfaces/HBSInterfaces.js';

import hbsHelpers from '../HandlebarHelpers/index.js';
import PlayWripper from '../PlayWripper/PlayWripper.js';

export default class ImageGenerator extends PlayWripper {
  private page?: Page;
  private template: string;
  private hbsData: DataReturn | ItemData | HistoryResults;
  private handlebars = Handlebars;
  public fileName: String;
  public attachment!: MessageAttachment;

  constructor(data: DataReturn | ItemData| HistoryResults, template: string) {
    super();

    this.template = template;

    this.hbsData = data;

    this.fileName = this.generateRandomFileName();

    this.registerHelpers();
  }

  async generateImage () {
    this.page = await this.browser.newPage();

    await this.page.setContent(this.compiledTemplate());

    await this.screenShot();

    await this.page.close();

    this.attachment = new MessageAttachment(`./src/itemDataBase/screenshots/${this.fileName}.png`, 'itemSearch.png');
  }

  private registerHelpers() {
    hbsHelpers.forEach(helper => {
      helper(this.handlebars);
    });
  }

  private getTemplateFile (): string  {
    return fs.readFileSync(`./src/common/HandlebarTemplates/${this.template}.hbs`, 'utf8');
  }

  private compiledTemplate (): any {
    if (process.env.MODE === "development") {
      console.log('Template compiled', this.hbsData);
    }
    return this.handlebars.compile(this.getTemplateFile())(this.hbsData);
  }

  private async screenShot () {
    try {
      const table = await this.page?.$('body');
      if (!table) return;
      const boundingBox = await table?.boundingBox();
      console.log('Saved a screenshot titled: ' + this.fileName + '.png');
      await this.page?.screenshot(
        {
          path: `./src/itemDataBase/screenshots/${this.fileName}.png`,
          omitBackground: true,
          clip: {x: 0, y: 0, width: boundingBox?.width ?? 0, height: boundingBox?.height ?? 0 },
          fullPage: true 
        }
      );  
    } catch (error) {
      console.log(error);
    }
  }

  private generateRandomFileName () {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}