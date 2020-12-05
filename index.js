const Discord = require('discord.js');
const client = new Discord.Client();

const https = require('https');
const itemUrl = 'https://raw.githubusercontent.com/Last-Oasis-Crafter/lastoasis-crafting-calculator/master/src/items.json';
let items = [];

client.on('ready', () => {
  https.get(itemUrl, (res) => {
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
});

// [999x] <Item Name>
const commandRegex = new RegExp(/(?:([0-9]+)x\s)?((?:\w\s?)+)/);

client.on('message', msg => {
  if (!msg.content.startsWith('!craft')) return;

  const commandText = msg.content.replace('!craft', '').trim().toLowerCase();
  const groups = commandText.match(commandRegex);
  if (groups == null) return msg.reply('Invalid syntax, use `!craft <amount>x <item>`');

  // first regex group is optional amount
  const amount = groups[1] || 1;
  // second regex group is item name
  const itemName = groups[2].toLowerCase().trim();

  // find items which match name
  // if multiple, return list of matches without ingredients
  const matchingItems = items.filter(item => item.name.trim().toLowerCase().includes(itemName));
  if (matchingItems.length === 0) return msg.reply('Item not found 😢');
  if (matchingItems.length > 1) {
    let itemString = '';
    for (let item of matchingItems) {
      itemString += `> ${item.name}\n`;
    }
    return msg.channel.send(`Multiple matching items for "${itemName}"\n${itemString}`)
  }

  // only one item matched, so print recipe
  const cursorItem = matchingItems[0];

  // build reply string
  const headerString = `\n**${amount}X ${cursorItem.name.toUpperCase()}**\nIngredients:\n`;
  let ingredientString = '';
  for (let ingredient of cursorItem.crafting[0].ingredients) {
    ingredientString += `> ${ingredient.count * amount}x ${ingredient.name}\n`
  }
  const sourceString = `*Source: https://lastoasiscrafter.com*`;

  return msg.channel.send(headerString + ingredientString + sourceString)
});

const token = require('./discordToken');
client.login(token);