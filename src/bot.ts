import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import { chunk } from "lodash";
import express from "express";
// import { lastTxnFunction } from "./lasttxn";

// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");


//TRACE ADDRESS FUNC
bot.command("trace", (ctx) => {
  const address = ctx.message?.text?.split(" ")[1]; // Extract the input address from the command
  if (address) {
    ctx.reply(`Address traced = ${address}`);
    // Call your function with the traced address here
    //lastTxnFunction(adress);
  } else {
    ctx.reply("Please provide an address to trace.");
  }
});


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
