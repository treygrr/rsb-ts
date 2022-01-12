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
import { SearchById } from "../../../api/PowerSearch/SearchById.js";

const hbs = new Hbs(import.meta.url);
;

@Discord()
class buttonExample {
  id!: string;
  itemName!: string;
  itemId!: number;
  selections: any[] = [];
  @Slash("price-check", { description: "Check the prices of items on the GE by searching for item names or ids." })
  async priceCheck(
    @SlashOption("name", { type: "STRING", description: "The item name to search", required: false })
    @SlashOption("id", { type: "NUMBER", description: "The item id to search", required: false })
    itemName: string,
    itemId: string,
    interaction: CommandInteraction,
    menuInteraction: SelectMenuInteraction
  ) {
    await interaction.deferReply();

    if (!itemName && !itemId) {
      await interaction.editReply("You need to provide either an item name or an item id. 😬");
      return
    }
    if (itemName) {

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
        this.itemId = parseInt(itemData.matchedResults[0].id);
        await this.getSingleItem(itemData.matchedResults[0].id, interaction);
        return;
      }

      if (itemData?.matchedResults?.length < 25) {
        await this.replyWithDropdown(itemData.matchedResults, interaction, attachment);
        return
      }

      if (itemData?.matchedResults?.length > 25) {
        await this.replyWithoutDropdown(itemData.matchedResults, interaction, attachment);
      }

      return;
    }

    if (itemId) {
      this.itemId = parseInt(itemId);
      await this.getSingleItem(itemId, interaction);
    }
  }

  async replyWithDropdown(itemData: { name: any; id: any; }[], interaction: CommandInteraction<CacheType>, attachment: MessageAttachment) {
    const embed = new MessageEmbed()
    .setTitle(`${itemData.length} results found for ${this.itemName}`)
    .setDescription('Select the item you want to see more info about!')
    .setImage(`attachment://itemSearch.png`);
    const selections: any[] = [];
    itemData.forEach(async (item) => {
      this.selections.push(
        {
          label: `${item.name} - ${item.id}`,
          value: item.id
        }
      )
    });

    const menu = new MessageSelectMenu()
      .addOptions(this.selections)
      .setCustomId("item-menu");

    const buttonRow = new MessageActionRow().addComponents(menu);
    await interaction.editReply({ embeds: [embed], files: [attachment], components: [buttonRow] });
  }

  async replyWithoutDropdown(itemData: { name: any; id: any; }[], interaction: CommandInteraction<CacheType>, attachment: MessageAttachment) {
    const embed = new MessageEmbed()
      .setTitle(`${itemData.length} results found for ${this.itemName}`)
      .setDescription('Discord limits how many options can be in a drop down.\nBecause this search has more than 25 results you have to\ndo /price-check again but instead of a name, use the ID from the image!')
      .setImage(`attachment://itemSearch.png`);

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
  
  async getSingleItem(itemId: string, interaction: CommandInteraction<CacheType> | SelectMenuInteraction) {
    const searchById = await new SearchById(itemId).getItemData();
    if (searchById.item) {
      console.log(searchById.item);
      await interaction.followUp(hbs.getHandleBarsTemplateCompiled({ single: true, data: {...searchById.item} }));
      return;
    }
    await interaction.followUp('Welp looks like something broke. 😬');
  }


  @SelectMenuComponent("item-menu")
  async handle(interaction: SelectMenuInteraction): Promise<unknown> {
    await interaction.deferReply();

    // extract selected value by member
    const itemValue = interaction.values?.[0];

    // if value not found
    if (!itemValue || itemValue === undefined || itemValue === null || itemValue === '' || itemValue === 'undefined') {
      return await interaction.followUp("Invalid Item ID, select again 👹");
    }
    const itemId = this.selections.find((r) => r.value === itemValue)?.value;

    this.getSingleItem(itemId, interaction)
    return;
  }
}