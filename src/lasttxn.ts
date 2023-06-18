npm install axios


// Function to retrieve the last transactions for an address from the PolygonScan API
async function getLastTransactions(address) {
  const API_KEY = "YOUR_POLYGONSCAN_API_KEY";
  const apiUrl = `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${API_KEY}`;

  try {
    const response = await axios.get(apiUrl);
    const transactions = response.data.result;
    return transactions;
  } catch (error) {
    console.error(`Failed to retrieve transactions for address ${address}:`, error);
    return [];
  }
}

// Function to send last transactions to a Telegram channel
async function sendLastTransactionsToChannel(transactions, channel) {
  const botToken = "YOUR_TELEGRAM_BOT_TOKEN";

  for (const txn of transactions) {
    const message = `Transaction Hash: ${txn.hash}\nBlock Number: ${txn.blockNumber}`;
    try {
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: channel,
        text: message,
      });
      console.log("Transaction sent to channel:", txn.hash);
    } catch (error) {
      console.error("Failed to send transaction to channel:", error);
    }
  }
}

// Main function to be called with a list of addresses
export async function lastTxnFunction(addresses) {
  for (const address of addresses) {
    const transactions = await getLastTransactions(address);
    await sendLastTransactionsToChannel(transactions, "YOUR_TELEGRAM_CHANNEL_ID");
  }
}
