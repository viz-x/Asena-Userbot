onst bot = require("../Utilis/events")
const Heroku = require("heroku-client")
const Config = require("../config")
const { sudoFormat } = require("../Utilis/Misc")
const heroku = new Heroku({
  token: Config.HEROKU.API_KEY,
})
const baseURI = "/apps/" + Config.HEROKU.APP_NAME

bot.addCommand(
  { pattern: "givesudo ?(.*)", fromMe: true, desc: "givesudo and reply a person" },
  async (message, match) => {
    const vars = await heroku.get(baseURI + "/config-vars")
    const sudo =
      sudoFormat(
      (vars.SUDO || "") +
        (!vars.SUDO ? '':',') +
          (message.reply_message.jid || message.mention[0] || match).split("@")[0]
    )
        await heroku
      .patch(baseURI + "/config-vars", {
        body: {
          ["SUDO"]: sudo,
        },
      })
      .catch(async (error) => {
        await message.sendMessage(Lang.ERROR)
      })
    await message.sendMessage("```" + `New SUDO Numbers are : ${sudo}` + "```")
  }
)

bot.addCommand(
  { pattern: "delsudo ?(.*)", fromMe: true, desc: "remove replied or mentioned or given num to sudo" },
  async (message, match) => {
    const vars = await heroku.get(baseURI + "/config-vars")
    const sudo = sudoFormat(
      (message.reply_message.jid || message.mention[0] || match).split("@")[0]
    )
    const newsudo = vars.SUDO.replace("," + sudo, "").replace(sudo, "")
    await heroku
      .patch(baseURI + "/config-vars", {
        body: {
          ["SUDO"]: newsudo,
        },
      })
      .catch(async (error) => {
        await message.sendMessage(Lang.ERROR)
      })
    await message.sendMessage(
      "```" + `New SUDO Numbers are : ${newsudo}` + "```"
    )
  }
)

bot.addCommand(
  { pattern: "getsudo ?(.*)", fromMe: true, desc: "show sudos" },
  async (message, match) => {
    const vars = await heroku.get(baseURI + "/config-vars")
    await message.sendMessage("```" + `SUDO Numbers are : ${vars.SUDO}` + "```")
  }
)
