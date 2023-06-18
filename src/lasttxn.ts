import axios, { AxiosResponse } from "axios";
import express from "express";
import { Bot, webhookCallback } from "grammy";

interface Transaction {
  hash: string;
  blockNumber: number;
  timeStamp: string;
}

async function getLastTransactions(address: string): Promise<Transaction[]> {
  const API_KEY: string = "POLYGONSCAN_API_KEY";
  const apiUrl: string = `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${API_KEY}`;

  try {
    const response: AxiosResponse = await axios.get(apiUrl);
    const parsedResponse = response.data;
    const transactions: Transaction[] = parsedResponse.result;

    transactions.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));

    const numberOfNewestTransactions = 5;
    const newestTransactions = transactions.slice(0, numberOfNewestTransactions);

    return newestTransactions;
  } catch (error) {
    console.error(`Failed to retrieve transactions for address ${address}:`, error);
    return [];
  }
}

async function sendLastTransactionsToChannel(transactions: Transaction[], channel: string): Promise<void> {
  const bot = new Bot("TELEGRAM_TOKEN");

  for (const txn of transactions) {
    const message = `Transaction Hash: ${txn.hash}\nBlock Number: ${txn.blockNumber}`;
    try {
      await bot.api.sendMessage(channel, message);
      console.log("Transaction sent to channel:", txn.hash);
    } catch (error) {
      console.error("Failed to send transaction to channel:", error);
    }
  }
}

export async function lastTxnFunction(addresses: string[]): Promise<void> {
  for (const address of addresses) {
    const transactions: Transaction[] = await getLastTransactions(address);
    await sendLastTransactionsToChannel(transactions, "YOUR_TELEGRAM_CHANNEL_ID");
  }
}

// Set up the webhook
const app = express();
app.use(express.json());

const bot = new Bot("TELEGRAM_TOKEN");
app.use(webhookCallback(bot, "express"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot listening on port ${PORT}`);
});

// Log any errors that occur during the bot's runtime
bot.catch((err) => {
  console.error("An error occurred:", err);
});
