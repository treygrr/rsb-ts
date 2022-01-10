import {
  ButtonInteraction,
  CommandInteraction,
  MessageButton,
  MessageActionRow,
  MessageEmbed
} from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";
import { UserData } from '../../../api/UserData.js';
import { Hbs } from '../../../api/HBars.js';
import { search } from '../../../api/PowerSearch/PowerSearch.js';

const hbs = new Hbs(import.meta.url);

@Discord()
class buttonExample {
  id!: string;
  itemName!: string;
  @Slash("price-check")
  async priceCheck(
    @SlashOption("item-name", { type: "STRING", description: "The item name to search" })
    itemName: string,
    interaction: CommandInteraction
  ) {
    if (!itemName) {
      await interaction.deferReply();
      return interaction.editReply("You need to provide an item name 😬");
    }
    this.itemName = itemName;
    const itemData = await search(itemName);
    console.log(itemData?.items?.length);
    if (!itemData?.items?.length && !itemData?.exactMatch) {
      await interaction.deferReply();
      return interaction.editReply("No item found matching your search criteria 😬");
    }

    if (itemData?.items?.length && !itemData?.exactMatch) {
      interaction.reply('this is where I would attach the file if I could.');
      return;
    }
    console.log('exact match: ', itemData?.exactMatch);

    const helloBtn = new MessageButton()
    .setLabel("List all Skills?")
    .setEmoji("👋")
    .setStyle("PRIMARY")
    .setCustomId("skills-btn");

    const row = new MessageActionRow().addComponents(helloBtn);

    interaction.editReply({
      content: 'found your item bro',
      components: [row],
    });

    setTimeout(function() {
      interaction.deleteReply();
    }, 60000);
  }

  // @ButtonComponent("skills-btn")
  // async mybtn(interaction: ButtonInteraction) {

  //   if (!this.itemName) {
  //     return interaction.reply('This button does not work anymore.😢');
  //   }
  //   interaction.deferReply({ephemeral: true});
  //   const userData = await new UserData(this.itemName).getUserData();
  //   interaction.editReply(hbs.getHandleBarsTemplateCompiled({ showSkills: true, ...userData}));
  // }
}