const Discord = require('discord.js');
const https = require('https');
const client = new Discord.Client();

// load items from lastoasiscrafter.com repo
const ITEM_DATA = 'https://raw.githubusercontent.com/Last-Oasis-Crafter/lastoasis-crafting-calculator/master/src/items.json';
let items = [];
client.on('ready', async () => {
  https.get(ITEM_DATA, (res) => {
    let body = "";
    res.on('data', (chunk) => {
      body += chunk;
    })
    res.on('end', () => {
      try {
        items = JSON.parse(body);
        console.log('Items loaded, ' + client.user.username);
      } catch (error) {
        console.error(error.message);
      }
    })
  }).on('error', (error) => {
    console.error(error.message);
  })
  console.log('Guilds: ');
  for (let g of client.guilds.cache) {
    console.log(g[1].name);
  }
});

// REGEX for [999x] <Item Name>
const commandRegex = new RegExp(/(?:([0-9]+)x\s)?(.+)/);
const normalize = (inputString) => inputString.toLowerCase().trim();

client.on('message', async msg => {
  if (!normalize(msg.content).startsWith('!craft')) return;
  const commandText = normalize(msg.content.replace('!craft', ''));
  const commandSplit = commandText.split(', ');

  let totalIngredients = [];
  for (let cmd of commandSplit) {
    const groups = cmd.match(commandRegex);
    if (groups == null) return msg.reply('Invalid syntax, use `!craft help` or `!craft <amount>x <item>, <amount>x <item>...`');

    if (groups[2] === 'help') {
      await msg.channel.send('Help with hosting fees and buy me a coffee! https://buymeacoffee.com/nromano\n');
      return msg.channel.send('Usage: `!craft <amount>x <item>, <amount>x <item>...`');
    }

    // first regex group is optional amount
    const amount = groups[1] || 1;
    // second regex group is item name
    const itemName = normalize(groups[2]);

    // find items which match name
    // if multiple, return list of matches without ingredients
    const matchingItems = items.filter(item => normalize(item.name).includes(itemName));
    if (matchingItems.length === 0) return msg.reply('Item not found 😢');
    if (matchingItems.length > 1) {
      let itemString = '';
      for (let item of matchingItems) {
        itemString += `> ${item.name}\n`;
      }
      await msg.channel.send(`Multiple matching items for "${itemName}"\n${itemString}`)
      continue;
    }

    // only one item matched, so print recipe
    const cursorItem = matchingItems[0];
    // build reply string
    const headerString = `\n**${amount}X ${cursorItem.name.toUpperCase()}**\nIngredients:\n`;
    let ingredientString = '';
    for (let ingredient of cursorItem.crafting[0].ingredients) {

      // add to total ingredients
      const ingredientInTotal = totalIngredients.find(i => i.name === ingredient.name);
      if (ingredientInTotal) {
        ingredientInTotal.count += ingredient.count * amount;
      } else {
        totalIngredients.push({ name: ingredient.name, count: ingredient.count * amount});
      }
      ingredientString += `> ${ingredient.count * amount}x ${ingredient.name}\n`
    }
    await msg.channel.send(headerString + ingredientString)
  }

  if (commandSplit.length < 2) return;
  let totalIngredientString = '';
  for (let totalIngredient of totalIngredients) {
    totalIngredientString += `> ${totalIngredient.count}x ${totalIngredient.name}\n`
  }
  await msg.channel.send(`\n**TOTAL**\n${totalIngredientString}`);
});

const token = require('./discordToken');
client.login(token);