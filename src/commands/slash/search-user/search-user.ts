import {
  ButtonInteraction,
  CommandInteraction,
  MessageButton,
  MessageActionRow,
  User,
  GuildMember,
} from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import path from 'path';
import { dirname } from "@discordx/importer";
import fs from 'fs';

import { UserData } from '../../../api/UserData.js';

const __filename = fileURLToPath(import.meta.url);
const fileName = path.basename(__filename)?.split('.')[0];

const hbs = fs.readFileSync(dirname(import.meta.url) + `/${fileName}.hbs`, 'utf8');
const template = Handlebars.compile(hbs.toString());

@Discord()
class buttonExample {
  username!: string;
  @Slash("search-user")
  async hello(
    @SlashOption("username", { type: "STRING", description: "The username to search" })
    username: string,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();

    const helloBtn = new MessageButton()
      .setLabel("List all Skills?")
      .setEmoji("👋")
      .setStyle("PRIMARY")
      .setCustomId("skills-btn");

    const row = new MessageActionRow().addComponents(helloBtn);
    if (!username) {
      return interaction.editReply("You need to provide a name 😬");
    }
    this.username = username;
    const userData = await new UserData(username).getUserData();
    if (userData.error) {
      return interaction.editReply("User not found 😬");
    }
    interaction.editReply({
      content: template({ basic: true, ...userData }),
      components: [row],
    });
  }

  @ButtonComponent("skills-btn")
  async mybtn(interaction: ButtonInteraction) {

    if (!this.username) {
      return interaction.reply('This button does not work anymore.😢');
    }
    interaction.deferReply({ephemeral: true});
    const userData = await new UserData(this.username).getUserData();
    interaction.editReply(template({ showSkills: true, ...userData}));
  }
}