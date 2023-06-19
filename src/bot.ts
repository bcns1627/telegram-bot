import { Bot, Context, webhookCallback } from "grammy";
import { chunk } from "lodash";
import express from "express";


// Create a bot using the Telegram token
export const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

// Create a queue to hold the actions
const actionQueue: (() => Promise<void>)[] = [];
let isProcessingActions = false;

// Function to process the actions in the queue
async function processActions(): Promise<void> {
  isProcessingActions = true;
  while (actionQueue.length > 0) {
    // Process the next action in the queue
    const action = actionQueue.shift();
    if (action) {
      await action();
    }
  }
  isProcessingActions = false;
}

// Create a Map to track the last action timestamp for each user
const userCooldowns = new Map<number, number>();

// Define the cooldown duration in milliseconds
const COOLDOWN_DURATION = 20 * 1000; // 20 seconds

// Function to check if a user is within the cooldown period
function isUserInCooldown(userId: number): boolean {
  const lastActionTime = userCooldowns.get(userId) || 0;
  const currentTime = Date.now();
  return currentTime - lastActionTime < COOLDOWN_DURATION;
}

// Function to update the last action timestamp for a user
function updateUserCooldown(userId: number): void {
  userCooldowns.set(userId, Date.now());
}

// Middleware to handle the cooldown before executing the command handler
bot.use(async (ctx, next) => {
  const userId = ctx.from?.id;
  if (userId && isUserInCooldown(userId)) {
    await ctx.reply("Please wait before performing another action.");
    return;
  }

  await next();

  if (userId) {
    updateUserCooldown(userId);
  }
});

// Handle the /id command to get the group chat ID
bot.command("id", async (ctx: Context) => {
  const chat = ctx.chat;
  if (chat?.type === "group" || chat?.type === "supergroup") {
    const groupId = chat.id;
    const formattedId = `\`${groupId}\``;
    await ctx.reply(`Group Chat ID: ${formattedId}`, { parse_mode: "MarkdownV2" });
  } else {
    await ctx.reply("This command can only be used in a group chat.");
  }
});

  bot.start();