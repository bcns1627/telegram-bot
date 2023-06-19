const { Bot } = require("grammy");
const { lastTxnFunction } = require("./lasttxn");

// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

// TRACE ADDRESS FUNC START
const tracedAddresses = new Set(); // Specify the type for tracedAddresses

bot.command("trace", async (ctx) => {
  const address = ctx.message?.text?.split(" ")[1]; // Extract the address from the command
  if (address) {
    tracedAddresses.add(address); // Add the traced address to the set
    ctx.reply(`Address traced = ${address}`);
    // Call the function from /lasttxn.js with the traced address as an array
    await sendMessageWithRetry(ctx, `Address traced = ${address}`);
    lastTxnFunction([address]); // Wrap the address in an array
  } else {
    ctx.reply("Please provide an address to trace.");
  }
});

// Helper function to send message with retry
async function sendMessageWithRetry(ctx, message, retryCount = 3, delay = 1000) {
  while (retryCount > 0) {
    try {
      await ctx.reply(message);
      return;
    } catch (error) {
      if (
        error.description === "Too Many Requests: retry after 5" &&
        retryCount > 0
      ) {
        await wait(delay);
        delay *= 2; // Exponential backoff
        retryCount--;
      } else {
        throw error;
      }
    }
  }
}

// Helper function to wait for a specific time
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Rest of the code...

// Start the bot using long polling
bot.start({
  polling: true,
});

console.log("Bot started");
