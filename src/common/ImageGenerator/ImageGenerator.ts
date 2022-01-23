import { Page } from '@playwright/test';
import Handlebars from 'handlebars';
import PlayWripper from '../PlayWripper/PlayWripper.js';
import fs from 'node:fs';
import hbsHelpers from '../HandlebarHelpers/index.js';
import { DataReturn, ItemData } from '../../Interfaces/SearchInterfaces.js';

export default class ImageGenerator extends PlayWripper {
  private page?: Page;
  private template: string;
  private hbsData: DataReturn | ItemData;
  private handlebars = Handlebars;
  public fileName: String;

  constructor(data: DataReturn | ItemData, template: string) {
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
    console.log('Template compiled', this.hbsData);
    return this.handlebars.compile(this.getTemplateFile())(this.hbsData);
  }

  private async screenShot () {
    try {
      const table = await this.page?.$('body > div > div > table');
      if (!table) return;
      const boundingBox = await table?.boundingBox();
      console.log('Saved a screenshot titled: ' + this.fileName + '.png');
      await this.page?.screenshot({path: `./src/itemDataBase/screenshots/${this.fileName}.png`, clip: {x: 0, y: 0, width: boundingBox?.width ?? 0, height: boundingBox?.height ?? 0 } });  
    } catch (error) {
      console.log(error);
    }
  }

  private generateRandomFileName () {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}