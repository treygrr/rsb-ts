import {
  CommandInteraction,
  MessageActionRow,
  MessageEmbed,
  MessageAttachment,
  MessageSelectMenu,
  SelectMenuInteraction
} from "discord.js";
import { ButtonComponent, Discord, SelectMenuComponent, Slash, SlashOption } from "discordx";
import { UserData } from '../../../api/UserData.js';
import { Hbs } from '../../../api/HBars.js';
import { search } from '../../../api/PowerSearch/PowerSearch.js';

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
    if (!itemData?.items?.length && !itemData?.exactMatch) {
      console.log('this here is the data if nothing is found', itemData);
      await interaction.editReply("No item found matching your search criteria 😬");
      return
    }

    if (!itemData?.exactMatch && itemData?.matchedResults?.length) {
      const attachment = new MessageAttachment('./choiceResult.png', 'choiceResult.png');
      console.log(attachment);
      
      await interaction.followUp('Looks like there was a lot of data, let me sift through it!');
      const itemValue = menuInteraction?.values?.[0];
      if (itemData.matchedResults.length <= 25) {
        const embed = new MessageEmbed()
        .setTitle(`${itemData.matchedResults.length} results found for ${itemName}`)
        .setDescription('Select and ID and I will show you the items price Info!')
        .setImage('attachment://choiceResult.png');

        itemData.matchedResults.forEach(async (item) => {
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
        return
      }
      const embed = new MessageEmbed()
        .setTitle(`${itemData.matchedResults.length} results found for ${itemName}`)
        .setDescription('Look - I can only show you the first 25 results! \n Do /price-check again but instead of a name, use the ID from the image!')
        .setImage('attachment://choiceResult.png');
      const selections: any[] = [];
      itemData.matchedResults.forEach(async (item) => {
        selections.push(
          {
            label: `${item.name} - ${item.id}`,
            value: item.id
          }
        )
      });
      await interaction.editReply({ embeds: [embed], files: [attachment]});
      return
    }

    if (itemData?.items?.length && !itemData?.exactMatch) {
      const attachment = new MessageAttachment('./choiceResult.png', 'choiceResult.png');
      console.log(attachment);
      const embed = new MessageEmbed()
        .setTitle(`${itemData.items.length} results found for ${itemName}`)
        .setDescription('Reply with the ID of the item you wish to price check!')
        .setImage('attachment://choiceResult.png');
      await interaction.followUp('Looks like there was a lot of data, let me sift through it!');
      
      const selections: any[] = [];
      itemData.items.forEach(async (item) => {
        selections.push(
          {
            label: `${item.name} - ${item.id}`,
            value: item.id
          }
        )
      });

      await interaction.editReply({ embeds: [embed], files: [attachment]});
      return
    }
    console.log('exact match: ', itemData?.exactMatch);



    interaction.editReply({
      content: 'found your item bro',
    });

    setTimeout(function() {
      interaction.deleteReply();
    }, 60000);
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
      `You selected: ${
        this.selections.find((r) => r.value === itemValue)?.label
      }\n Give me one second and I'll fetch that for you.`
    );
    return;
  }
}