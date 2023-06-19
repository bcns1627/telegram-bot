import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import { chunk } from "lodash";
import express from "express";
import { lastTxnFunction } from "./lasttxn";

// Create a bot using the Telegram token
export const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

// TRACE ADDRESS FUNC START
const tracedAddresses = new Set<string>(); // Specify the type for tracedAddresses

bot.command("/commands/trace", (ctx) => {
  const address = ctx.message?.text?.split(" ")[1]; // Extract the address from the command
  if (address) {
    tracedAddresses.add(address); // Add the traced address to the set
    ctx.reply(`Address traced = ${address}`);
    lastTxnFunction([address]); // Call the function from /lasttxn.ts with the traced address as an array
  } else {
    ctx.reply("Please provide an address to trace.");
  }
});

bot.command("/commands/untrace", (ctx) => {
  const address = ctx.message?.text?.split(" ")[1]; // Extract the address from the command
  if (address) {
    tracedAddresses.delete(address); // Remove the traced address from the set
    ctx.reply(`Address untraced = ${address}`);
    // Perform any necessary cleanup or actions for removing the traced address
  } else {
    ctx.reply("Please provide an address to untrace.");
  }
});

bot.command("/commands/traced", (ctx) => {
  if (tracedAddresses.size > 0) {
    const tracedList = Array.from(tracedAddresses).join("\n");
    ctx.reply(`Traced addresses:\n${tracedList}`);
  } else {
    ctx.reply("No addresses are currently traced.");
  }
});

bot.command("/commands/untraceall", (ctx) => {
  tracedAddresses.clear(); // Clear all traced addresses from the set
  ctx.reply("All addresses untraced.");
  // Perform any necessary cleanup or actions for removing all traced addresses
});

// TRACED FUNC END

// Suggest commands in the menu
bot.api.setMyCommands([
  { command: "/commands/yo", description: "Be greeted by the bot" },
  {
    command: "/commands/effect",
    description: "Apply text effects on the text. (usage: /effect [text])",
  },
]);

// Handle the /commands/id command to get the group chat ID
bot.command("/commands/id", (ctx) => {
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
  app.use('/commands', webhookCallback(bot, "express"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  // Use Long Polling for development
  bot.start();
}
