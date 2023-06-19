import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import { chunk } from "lodash";
import express from "express";
import { lastTxnFunction } from "./lasttxn";

// Create a bot using the Telegram token
export const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

bot.command("trace", (ctx) => ctx.reply("Welcome! Up and running."));


  bot.start();