from telegram.ext import Updater, CommandHandler

# Define a function to handle the /start command
def start(update, context):
    context.bot.send_message(chat_id=update.effective_chat.id, text="Hello, I'm your bot!")

# Create an instance of the Updater class with your bot token
updater = Updater(token='process.env.TELEGRAM_TOKEN ', use_context=True)

# Get the dispatcher to register handlers
dispatcher = updater.dispatcher

# Register a command handler for the /start command
dispatcher.add_handler(CommandHandler('start', start))

# Start the bot
updater.start_polling()