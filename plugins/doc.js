const bot = require("../Utilis/events")
bot.addCommand(
  { pattern: "doc ?(.*)", fromMe: true, desc: "convert to doc" },
  async (message, match) => {
   if (!message.reply_message || !message.reply_message.mimetype)
      return await message.sendMessage("Reply to a media message")
    match = !match ? "file" : match
    match =
      match.split(".").length == 1
        ? message.reply_message.audio
          ? `${match}.mp3`
          : `${match}.${message.reply_message.mimetype.split("/").pop()}`
        : match
    return await message.sendMessage(
      await message.reply_message.downloadMediaMessage(),
      { filename: match, mimetype: message.reply_message.mimetype },
      "documentMessage"
    )
  }
)
