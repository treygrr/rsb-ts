import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

import { DataReturn } from "../../../Interfaces/SearchInterfaces";

import GrandExchangeSearch from "../../../common/GrandExchangeSearch/GrandExchangeSearch.js";
import { SearchById } from "../../../common/GrandExchangeSearch/SearchById.js";
import ImageGenerator from "../../../common/ImageGenerator/ImageGenerator.js";
import { qwuip } from "../../../common/RunescapeDatas/qwuips.js";

@Discord()
class buttonExample {
  id!: string;
  itemName!: string;
  osrs = false;
  itemId!: number;
  selections: any[] = [];
  itemData!: DataReturn;

  @Slash("price-check", { description: "Check the prices of items on the GE by searching for item names or ids." })
  async priceCheck(
    @SlashOption("name", { type: "STRING", description: "The item name to search", required: false })
    @SlashOption("id", { type: "NUMBER", description: "The item id to search", required: false })
    @SlashOption("osrs", { type: "BOOLEAN", description: "Search the OSRS GE for items", required: false })
    itemName: string,
    itemId: string,
    osrs: boolean,
    interaction: CommandInteraction,
  ) 
  {
    await interaction.deferReply();

    if (!itemName && !itemId) {
      await interaction.editReply("You need to provide either an item name or an item id. 😬");
      return
    }

    this.osrs = osrs;

    if (itemName) {

      this.itemName = itemName;

      const data = new GrandExchangeSearch({ oldschool: this.osrs });

      const itemData = await data.search({ searchQuery: this.itemName, disableAll: true });

      if (itemData?.errors) {
        await interaction.editReply(itemData.errorMessages.join('\n'));
        return
      }

      if (!itemData?.matchedResults || !itemData.matchedResults.length) {
        await interaction.editReply('Nothing found matching your search criteria. 😬')
        return;
      }

      if (itemData?.matchedResults?.length === 1) {
        await this.replyWithExactMatch(interaction, itemData);
        return;
      }

      if (itemData?.matchedResults?.length > 1) {
        await this.replyWithFoundItems(itemData, interaction);
      }

      return;
    }

    if (itemId) {
      this.itemId = parseInt(itemId);

      await this.getSingleItem(itemId, interaction);
    }
  }

  async replyWithExactMatch(interaction: CommandInteraction, itemData: DataReturn) {
    const searchById = await new SearchById(itemData.matchedResults[0].id, this.osrs).getItemData();

    const image = new ImageGenerator(searchById, 'SingleResult');

    await image.generateImage();

    await interaction.editReply({ content: qwuip(itemData.matchedResults[0].name), files: [image.attachment.attachment] });
  }

  async replyWithFoundItems(dataReturn: DataReturn, interaction: CommandInteraction) {
    const image = new ImageGenerator(dataReturn, 'ResultsTable');

    await image.generateImage();

    await interaction.editReply({ content: qwuip(this.itemName), files: [image.attachment.attachment] });

    return
  }

  async getSingleItem(itemId: string, interaction: CommandInteraction) {
    const searchById = await new SearchById(itemId, this.osrs).getItemData();
    
    const image = new ImageGenerator(searchById, 'SingleResult');

    await image.generateImage();

    await interaction.editReply({ content: qwuip(searchById.data.name), files: [image.attachment.attachment] });
  }
}