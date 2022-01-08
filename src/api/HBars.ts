import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import path from 'path';
import { dirname } from "@discordx/importer";
import fs from 'fs';

const getFileName = (fileName: string) => {
  return path.basename(fileName)?.split('.')[0];
}

const getTemplate = (path: string, fileName: string) => {
  const hbs = fs.readFileSync(path + `/${fileName}.hbs`, 'utf8');
  return Handlebars.compile(hbs.toString());
}

export class Hbs {
  public hbs = Handlebars;
  public path: string;
  public fileName!: string;
  public folderPath!: string

  constructor(path: string) {
    this.path = path;
    this.fileName = this.getFileName();
    this.folderPath = this.getFolderPath();
  }

  getFileName(): string {
    this.fileName = this.path.split('.')[0];
    this.fileName = this.fileName.split('/')[this.fileName.split('/').length - 1];
    return this.fileName;
  }

  getFolderPath(): string {
    console.log(this.path);
    const fPath = this.path.split('/');
    fPath.pop();
    console.log(fPath);
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