import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import { chunk } from "lodash";
import express from "express";


// Create a bot using the Telegram token
export const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

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


  bot.start();