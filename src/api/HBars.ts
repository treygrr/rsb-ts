import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import path from 'path';
import { dirname, importx } from "@discordx/importer";
import fs from 'fs';

import { skillList } from './runescapeData/skillList.js';


const getFileName = (fileName: string) => {
  return path.basename(fileName)?.split('.')[0];
}

const getTemplate = (path: string, fileName: string) => {
  const hbs = fs.readFileSync(path + `/${fileName}.hbs`, 'utf8');
  return Handlebars.compile(hbs.toString());
}

interface hbh {
  (): any;
}

export class Hbs {
  public hbs = Handlebars;
  public path: string;
  public fileName!: string;
  public folderPath!: string;

  constructor(path: string) {
    this.path = path;
    this.fileName = this.getFileName();
    this.folderPath = this.getFolderPath();
    this.setHandleBarHelpers();
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

  getHandleBarsTemplateFile(): string | null {
    return fs.readFileSync(this.getFolderPath() + `/${this.getFileName()}.hbs`, 'utf8');
  }

  getHandleBarsTemplateCompiled(obj: object): any {
    return this.hbs.compile(this.getHandleBarsTemplateFile())(obj);
  }

  takeScreenshot(path: string, fileName: string) {
    // take a screenshot of hbs file rendered with puppeteer
  }
}

export default { fileURLToPath, Handlebars, path, dirname, fs, getTemplate, getFileName };