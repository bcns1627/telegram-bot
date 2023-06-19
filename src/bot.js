const { Bot } = require("grammy");


// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");


// Start command handler
bot.command("start", (ctx) => {
  ctx.reply("Welcome to the bot! Type /help for available commands.");
});

// Help command handler
bot.command("help", (ctx) => {
  const helpMessage = `
  Available commands:
  /start - Start the bot
  /help - Show help message
  /ping - Check bot's response time
  `;
  ctx.reply(helpMessage);
});

// Ping command handler
bot.command("ping", (ctx) => {
  const start = Date.now();
  ctx.reply("Pinging...");
  const end = Date.now();
  const responseTime = end - start;
  ctx.reply(`Pong! Response time: ${responseTime}ms`);
});

// Error handler
bot.catch((err) => {
  console.error("Error:", err);
});

// Start the bot
bot.start();

// Start the bot using long polling
bot.start({
  polling: true,
});

console.log("Bot started");
