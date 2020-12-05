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

client.on('message', msg => {
  if (msg.content.startsWith('!craft')) {
    const itemName = msg.content.replace('!craft', '').trim().toLowerCase();
    if (!itemName) return msg.reply('Invalid syntax, use `!craft <item>`')
    // find item
    const cursorItem = items.find(item => item.name.trim().toLowerCase().includes((itemName)));
    if (!cursorItem) return msg.reply('Item not found 😢');

    console.log(cursorItem);

    // build reply string
    const headerString = `\n**${cursorItem.name.toUpperCase()}**\nIngredients:\n`;
    let ingredientString = '';
    for (let ingredient of cursorItem.crafting[0].ingredients) {
      ingredientString += `> ${ingredient.count}x ${ingredient.name}\n`
    }
    const sourceString = `*Source: https://lastoasiscrafter.com*`;

    return msg.reply(headerString + ingredientString + sourceString)
  }
});

const token = require('./discordToken');
client.login(token);