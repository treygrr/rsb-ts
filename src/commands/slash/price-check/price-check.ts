import {
  CommandInteraction,
  MessageActionRow,
  MessageEmbed,
  MessageAttachment,
  MessageSelectMenu,
  SelectMenuInteraction,
  CacheType,
  BufferResolvable,
  FileOptions,
  HTTPAttachmentData
} from "discord.js";
import { ButtonComponent, Discord, SelectMenuComponent, Slash, SlashOption } from "discordx";
import { UserData } from '../../../api/UserData.js';
import { Hbs } from '../../../api/HBars.js';
import { search } from '../../../api/PowerSearch/PowerSearch.js';
import { Stream } from "stream";

const hbs = new Hbs(import.meta.url);

@Discord()
class buttonExample {
  id!: string;
  itemName!: string;
  selections: any[] = [];

  @Slash("price-check")
  async priceCheck(
    @SlashOption("item-name", { type: "STRING", description: "The item name to search" })
    itemName: string,
    interaction: CommandInteraction,
    menuInteraction: SelectMenuInteraction
  ) {
    await interaction.deferReply();

    if (!itemName) {
      await interaction.editReply("You need to provide an item name 😬");
      return
    }

    this.itemName = itemName;

    const itemData = await search(itemName);

    const attachment = new MessageAttachment(`./src/itemDataBase/screenshots/${this.itemName}.png`, 'itemSearch.png');

    if (!itemData) {
      await interaction.editReply('I could not find data for some reason. 🥴');
    } 

    if (itemData?.errors) {
      await interaction.editReply(itemData.errorMessages.join('\n'));
      return
    }

    if (!itemData?.matchedResults || !itemData.matchedResults.length) {
      await interaction.editReply('Nothing found matching your search criteria. 😬')
      return;
    }

    if (itemData?.matchedResults?.length === 1) {
      await this.replyWithExactMatch(interaction, attachment)
      return;
    }

    if (itemData?.matchedResults?.length < 25) {
      await interaction.editReply('Found less than 25 results');
      return
    }

    if (itemData?.matchedResults?.length > 25) {
      await interaction.editReply('Found more than 25 results');
    }
    
    setTimeout(function () {
      interaction.deleteReply();
    }, 60000);

    return;
  }

  async replyWithDropdown(itemData: { name: any; id: any; }[], interaction: CommandInteraction<CacheType>, attachment: MessageAttachment) {
    
  }

  async replyWithoutDropdown(itemData: { name: any; id: any; }[], interaction: CommandInteraction<CacheType>, attachment: MessageAttachment) {
    const embed = new MessageEmbed()
      .setTitle(`${itemData.length} results found for ${this.itemName}`)
      .setDescription('Discord limits how many options can be in a drop down.\nBecause this has more than 25 you have to\ndo /price-check again but instead of a name, use the ID from the image!')
      .setImage(`attachment://itemSearch.png`);
    const selections: any[] = [];
    itemData.forEach(async (item) => {
      selections.push(
        {
          label: `${item.name} - ${item.id}`,
          value: item.id
        }
      )
    });
    await interaction.editReply({ embeds: [embed], files: [attachment] });
    return
  }

  async replyWithExactMatch(interaction: CommandInteraction<CacheType>, attachment: MessageAttachment) {
    const embed = new MessageEmbed()
      .setTitle(`We found your item!`)
      .setDescription('Hang tight and we will grab even more info!')
      .setImage(`attachment://itemSearch.png`);

    await interaction.editReply({ embeds: [embed], files: [attachment] });
  }
  


  @SelectMenuComponent("item-menu")
  async handle(interaction: SelectMenuInteraction): Promise<unknown> {
    await interaction.deferReply();

    // extract selected value by member
    const itemValue = interaction.values?.[0];

    // if value not found
    if (!itemValue) {
      return await interaction.followUp("invalid role id, select again");
    }

    await interaction.followUp(
      `You selected: ${this.selections.find((r) => r.value === itemValue)?.label
      }\n Give me one second and I'll fetch that for you.`
    );
    return;
  }
}