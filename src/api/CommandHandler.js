import fs from 'fs';
import Handlebars from 'handlebars';
import * as commands from '../commands/*/index.js';

console.log(commands)

export default class CommandHandler {
    constructor(args) {
        if (!args.command) {
            throw new Error('CommandHandler requires a command.');
        }
        if (!args.interaction) {
            throw new Error('CommandHandler requires an interaction.');
        }
        this.slashCommand = args.command;
        this.interaction = args.interaction;
        this.handleBarTemplate = this.getHandleBarTempleate();
        this.bootModule = this.setBootModule(this.slashCommand);

        console.log(this.bootModule);
    }

    getHandleBarTempleate() {
        try {
            return Handlebars.compile(fs.readFileSync(`./src/commands/${this.slashCommand}/${this.slashCommand}.hbs`, 'utf8'));
        }
        catch (error) {
            console.error(error);
        } 
    }
    setBootModule() {
        return setBootModule(this.slashCommand);

    }
    upperCaseFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

const upperCaseFirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const setBootModule = async (slashCommand) => {
    // using es6 syntax return the function from a module
    try {
        const bootCommand = await import(`../commands/${upperCaseFirst(slashCommand)}/index.js`).then(module => {return module});
        return bootCommand;
    }
    catch (error) {
        console.error(error);
    }
}

// const bootCommand = await import(`../commands/${upperCaseFirst('User')}/index.js`);
// console.log('bruh', bootCommand);