import { Bot } from "grammy";
import axios, { AxiosResponse } from "axios";

interface Transaction {
  hash: string;
  blockNumber: number;
  timeStamp: string; // Add timeStamp property
}

// Function to retrieve the last transactions for an address from the PolygonScan API
async function getLastTransactions(address: string): Promise<Transaction[]> {
  const API_KEY: string = "POLYGONSCAN_API_KEY";
  const apiUrl: string = `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${API_KEY}`;

  try {
    const response: AxiosResponse = await axios.get(apiUrl);
    const parsedResponse = response.data;
    const transactions: Transaction[] = parsedResponse.result;

    // Sort transactions by timeStamp in descending order
    transactions.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));

    // Specify the number of newest transactions you want to retrieve
    const numberOfNewestTransactions = 5;
    const newestTransactions = transactions.slice(0, numberOfNewestTransactions);

    return newestTransactions;
  } catch (error) {
    console.error(`Failed to retrieve transactions for address ${address}:`, error);
    return [];
  }
}

// Function to send last transactions to a Telegram channel
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

// Main function to be called with a list of addresses
export async function lastTxnFunction(addresses: string[]): Promise<void> {
  for (const address of addresses) {
    const transactions: Transaction[] = await getLastTransactions(address);
    await sendLastTransactionsToChannel(transactions, "YOUR_TELEGRAM_CHANNEL_ID");
  }
}
