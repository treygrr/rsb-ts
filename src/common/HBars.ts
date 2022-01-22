import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import path from 'path';
import { dirname, importx } from "@discordx/importer";
import fs from 'fs';
import puppeteer from 'puppeteer';
import { skillList } from './RunescapeDatas/skillList.js';

interface hbh {
  (): any;
}

export class Hbs {
  public hbs = Handlebars;
  public path: string;
  public fileName!: string;
  public folderPath!: string;
  public puppeteer!: any;
  data: any;

  constructor(path: string) {
    this.path = path;
    this.fileName = this.getFileName();
    this.folderPath = this.getFolderPath();
    this.setHandleBarHelpers();
    this.puppeteer = puppeteer;
    console.log('this is the path', this.path)
  }

  setHandleBarHelpers() {
    this.hbs.registerHelper("getSkillName", function(value: string) {
      const skillName:string = skillList[value];
      var result = Handlebars.escapeExpression(skillName);
      return new Handlebars.SafeString(skillName);
    });

    // a function that returns numbers formatted with commas
    this.hbs.registerHelper("formatNumber", function(value: number) {
      return new Handlebars.SafeString(value.toLocaleString());
    });
  }

  getFileName(): string {
    // get the full path to the current file
    this.fileName = this.path.split('.')[0];
    this.fileName = this.fileName.split(path.sep)[this.fileName.split(path.sep).length - 1];
    return this.fileName;
  }

  getFolderPath(): string {
    // get folder path current file is in for windows or linx
    const pathy = this.path.split('.')[0];
    const pathy2 = pathy.split(path.sep);
    const pathy3 = pathy2.pop();
    const pathy4 = pathy2.join(path.sep);
    return pathy4
  }

  getHandleBarsTemplateFile(fileName?: string): string {
    if (fileName) return fs.readFileSync(this.getFolderPath() + `/${fileName}.hbs`, 'utf8');
    return fs.readFileSync(this.getFolderPath() + `/${this.getFileName()}.hbs`, 'utf8');
  }

  getHandleBarsTemplateCompiled(fileName?: string): any {
    if (fileName) return this.hbs.compile(this.getHandleBarsTemplateFile(fileName))(this.data);
    return this.hbs.compile(this.getHandleBarsTemplateFile())(this.data);
  }

  private setTemplateData(data: any) {
    this.data = data;
  }

  async takeScreenshot(path: string, fileName: string) {
    const browser = await this.puppeteer.launch({
      headless: false
    });

    // take a screenshot of hbs file rendered with puppeteer
  }
}