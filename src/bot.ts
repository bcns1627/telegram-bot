import { Bot, InlineKeyboard } from "grammy";
import { chunk } from "lodash";
import express from "express";
import { lastTxnFunction } from "./lasttxn";

// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

//TRACE ADDRESS FUNC START
const tracedAddresses = new Set<string>();

bot.command("trace", (ctx) => {
  const address = ctx.message?.text?.split(" ")[1];
  if (address) {
    tracedAddresses.add(address);
    ctx.reply(`Address traced = ${address}`);
    lastTxnFunction([address]);
  } else {
    ctx.reply("Please provide an address to trace.");
  }
});

bot.command("untrace", (ctx) => {
  const address = ctx.message?.text?.split(" ")[1];
  if (address) {
    tracedAddresses.delete(address);
    ctx.reply(`Address untraced = ${address}`);
  } else {
    ctx.reply("Please provide an address to untrace.");
  }
});

bot.command("traced", (ctx) => {
  if (tracedAddresses.size > 0) {
    const tracedList = Array.from(tracedAddresses).join("\n");
    ctx.reply(`Traced addresses:\n${tracedList}`);
  } else {
    ctx.reply("No addresses are currently traced.");
  }
});

bot.command("untraceall", (ctx) => {
  tracedAddresses.clear();
  ctx.reply("All addresses untraced.");
});

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

// Suggest commands in the menu
bot.api.setMyCommands([
  { command: "yo", description: "Be greeted by the bot" },
  {
    command: "effect",
    description: "Apply text effects on the text. (usage: /effect [text])",
  },
]);

// Start the server
if (process.env.NODE_ENV === "production") {
  // Use Webhooks for the production server
  const app = express();
  app.use(express.json());

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  // Use Long Polling for development
  bot.start();
}
