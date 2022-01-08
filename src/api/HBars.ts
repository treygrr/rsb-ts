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
    this.fileName = this.path.split('.')[0];
    this.fileName = this.fileName.split('/')[this.fileName.split('/').length - 1];
    return this.fileName;
  }

  getFolderPath(): string {
    const fPath = this.path.split('/');
    fPath.pop();
    // remove first three indexes from array
    fPath.splice(0, 3);
    return fPath.join('/');
  }

  getHandleBarsTemplateFile(): string {
    return fs.readFileSync(this.getFolderPath() + `/${this.getFileName()}.hbs`, 'utf8');
  }

  getHandleBarsTemplateCompiled(obj: object): any {
    return this.hbs.compile(this.getHandleBarsTemplateFile())(obj);
  }
}

export default { fileURLToPath, Handlebars, path, dirname, fs, getTemplate, getFileName };