import {
  ButtonInteraction,
  CommandInteraction,
  MessageButton,
  MessageActionRow,
  User,
  GuildMember,
} from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";
import { UserData } from '../../../api/UserData.js';

import HBars from '../../../api/HBars.js';
import { Hbs } from '../../../api/HBars.js';
const hbz = new Hbs(import.meta.url);

const __filename = HBars.fileURLToPath(import.meta.url);
const fileName = HBars.getFileName(__filename);

const hbs = HBars.fs.readFileSync(HBars.dirname(import.meta.url) + `/${fileName}.hbs`, 'utf8');
const template = HBars.Handlebars.compile(hbs.toString());

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

    hbz.getHandleBarsTemplateCompiled({ basic: true, ...userData});
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