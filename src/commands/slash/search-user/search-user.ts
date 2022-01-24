import {
  ButtonInteraction,
  CommandInteraction,
  MessageButton,
  MessageActionRow,
  User,
  GuildMember,
} from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";
import { UserData } from '../../../common/UserData.js';
import { Hbs } from '../../../common/HBars.js';
import path from 'path';
import { fileURLToPath } from "url";
import ImageGenerator from "../../../common/ImageGenerator/ImageGenerator.js";

const hbs = new Hbs(fileURLToPath(import.meta.url));

@Discord()
class buttonExample {
  username!: string;
  @Slash("search-user", { description: "Search for a user by username." })
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
    if (userData?.error) {
      console.log(userData.error.message)
      return interaction.editReply(userData.error.message);
    }
    
    const image = new ImageGenerator(userData, 'SearchUser');

    await image.generateImage();

    await interaction.editReply({ files: [image.attachment.attachment] });
  }

  @ButtonComponent("skills-btn")
  async mybtn(interaction: ButtonInteraction) {

    if (!this.username) {
      return interaction.reply('This button does not work anymore.😢');
    }
    interaction.deferReply();
    
    const userData = await new UserData(this.username).getUserData();
    interaction.editReply(hbs.getHandleBarsTemplateCompiled({ showSkills: true, ...userData}));
  }
}