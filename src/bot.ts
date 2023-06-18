import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import { chunk } from "lodash";
import express from "express";
import { lastTxnFunction } from "./lasttxn";

// Create a bot using the Telegram token
export const bot = new Bot(process.env.TELEGRAM_TOKEN || "");


//TRACE ADDRESS FUNC START
//TRACE ADDRESS FUNC START
const tracedAddresses = new Set<string>(); // Specify the type for tracedAddresses

bot.command("trace", (ctx) => {
  const address = ctx.message?.text?.split(" ")[1]; // Extract the address from the command
  if (address) {
    tracedAddresses.add(address); // Add the traced address to the set
    ctx.reply(`Address traced = ${address}`);
    // Call the function from /lasttxn.ts with the traced address as an array
    lastTxnFunction([address]); // Wrap the address in an array
  } else {
    ctx.reply("Please provide an address to trace.");
  }
});

// Handle the /untrace command to remove the traced address
bot.command("untrace", (ctx) => {
  const address = ctx.message?.text?.split(" ")[1]; // Extract the address from the command
  if (address) {
    tracedAddresses.delete(address); // Remove the traced address from the set
    ctx.reply(`Address untraced = ${address}`);
    // Perform any necessary cleanup or actions for removing the traced address
  } else {
    ctx.reply("Please provide an address to untrace.");
  }
});

// Handle the /traced command to show the traced addresses
bot.command("traced", (ctx) => {
  if (tracedAddresses.size > 0) {
    const tracedList = Array.from(tracedAddresses).join("\n");
    ctx.reply(`Traced addresses:\n${tracedList}`);
  } else {
    ctx.reply("No addresses are currently traced.");
  }
});

// Handle the /untraceall command to remove all traced addresses
bot.command("untraceall", (ctx) => {
  tracedAddresses.clear(); // Clear all traced addresses from the set
  ctx.reply("All addresses untraced.");
  // Perform any necessary cleanup or actions for removing all traced addresses
});



//TRACED FUNC END


// Suggest commands in the menu
bot.api.setMyCommands([
  { command: "yo", description: "Be greeted by the bot" },
  {
    command: "effect",
    description: "Apply text effects on the text. (usage: /effect [text])",
  },
]);


// Handle the /id command to get the group chat ID
bot.command("id", (ctx) => {
  const chat = ctx.chat;
  if (chat?.type === "group" || chat?.type === "supergroup") {
    const groupId = chat.id;
    const formattedId = `\`${groupId}\``;
    ctx.reply(`Group Chat ID: ${formattedId}`, { parse_mode: "MarkdownV2" });
  } else {
    ctx.reply("This command can only be used in a group chat.");
  }
});

// Start the server
if (process.env.NODE_ENV === "production") {
  // Use Webhooks for the production server
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  // Use Long Polling for development
  bot.start();
}