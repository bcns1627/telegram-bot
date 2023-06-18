import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import { chunk } from "lodash";
import express from "express";
import { lastTxnFunction } from "./lasttxn";

// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");


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


const textEffectResponseAccessor = (
  originalText: string,
  modifiedText?: string
) =>
  `Original: ${originalText}` +
  (modifiedText ? `\nModified: ${modifiedText}` : "");

const parseTextEffectResponse = (
  response: string
): {
  originalText: string;
  modifiedText?: string;
} => {
  const originalText = (response.match(/Original: (.*)/) as any)[1];
  const modifiedTextMatch = response.match(/Modified: (.*)/);

  let modifiedText;
  if (modifiedTextMatch) modifiedText = modifiedTextMatch[1];

  if (!modifiedTextMatch) return { originalText };
  else return { originalText, modifiedText };
};


// Suggest commands in the menu
bot.api.setMyCommands([
  { command: "yo", description: "Be greeted by the bot" },
  {
    command: "effect",
    description: "Apply text effects on the text. (usage: /effect [text])",
  },
]);

// Handle all other messages and the /start command
const introductionMessage = `Hello! I'm a Telegram NIGERIAN bot.
IM NIGGER WELCOME

<b>Commands</b>
/XD - GETTING FUCKED
`

const replyWithIntro = (ctx: any) =>
  ctx.reply(introductionMessage, {
    parse_mode: "HTML",
  });

bot.command("start", replyWithIntro);
bot.on("message", replyWithIntro);


// Handle the /id command to get the channel ID
bot.command("id", async (ctx) => {
  const chat = ctx.message?.chat;
  if (chat?.type === "channel") {
    const channelId = chat.id;
    ctx.reply(`Channel ID: ${channelId}`);
  } else {
    ctx.reply("This command can only be used in a channel.");
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
