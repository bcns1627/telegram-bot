// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

// Handle the /xd command to reply with "XDD FUCK YOU"
bot.command("xd", (ctx: any) => {
  ctx.reply("XDD FUCK YOU");
});

// Handle all other commands and messages
bot.on("message", (ctx: any) => {
  // Ignore all other commands and messages
});

// Start the server
if (process.env.NODE_ENV === "production") {
  // Use Webhooks for the production server
  // ...
} else {
  // Use Long Polling for development
  bot.start();
}
