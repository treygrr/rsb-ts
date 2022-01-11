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

    if (itemData?.errors) {
      await interaction.editReply(itemData.errorMessages.join('\n'));
      return
    }


    if (!itemData?.items?.length && !itemData?.exactMatch && !itemData?.matchedResults?.length) {
      console.log('this here is the data if nothing is found', itemData);
      await interaction.editReply("No item found matching your search criteria 😬");
      return
    }

    if (!itemData?.exactMatch && itemData?.matchedResults?.length) {
      const itemValue = menuInteraction?.values?.[0];

      if (itemData.matchedResults.length <= 25) {
        const attachment = new MessageAttachment(`./${this.itemName}.png`, `${this.itemName}.png`);
        await this.replyWithDropdown(itemData.matchedResults, interaction, attachment);
        return
      }

      if (itemData.matchedResults.length > 25) {
        const attachment = new MessageAttachment(`./${this.itemName}.png`, `${this.itemName}.png`);
        await this.replyWithoutDropdown(itemData.matchedResults, interaction, attachment);
      }
    }

    if (itemData?.items?.length && !itemData?.exactMatch && !itemData?.matchedResults?.length) {
      if (itemData.items.length <= 25) {
        const attachment = new MessageAttachment(`./${this.itemName}.png`, `${this.itemName}.png`);
        await this.replyWithDropdown(itemData.items, interaction, attachment);
        return
      }

      if (itemData.items.length > 25) {
        const attachment = new MessageAttachment(`./${this.itemName}.png`, `${this.itemName}.png`);
        await this.replyWithoutDropdown(itemData.items, interaction, attachment);
        return
      }
    }
    const attachment = new MessageAttachment(`./${this.itemName}.png`, `${this.itemName}.png`);
    await this.replyWithExactMatch(interaction, attachment);
    
    setTimeout(function () {
      interaction.deleteReply();
    }, 60000);

    return;
  }

  async replyWithDropdown(itemData: { name: any; id: any; }[], interaction: CommandInteraction<CacheType>, attachment: MessageAttachment) {
    const embed = new MessageEmbed()
      .setTitle(`${itemData.length} results found for ${this.itemName}`)
      .setDescription('Select an ID and I will show you the items price Info!')
      .setImage(`attachment://${this.itemName}.png`);

    itemData.forEach(async (item: { name: any; id: any; }) => {
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
      .setDescription('Discord limits how many options can be in a drop down.\nBecause this has more than 25 you have to\ndo /price-check again but instead of a name, use the ID from the image!')
      .setImage(`attachment://${this.itemName}.png`);
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
      .setImage(`attachment://${this.itemName}.png`);

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