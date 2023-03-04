const bot = require("../Utilis/events");
const Heroku = require("heroku-client");
const Config = require("../config");
const { sudoFormat } = require("../Utilis/Misc");

const heroku = new Heroku({ token: Config.HEROKU.API_KEY });
const baseURI = "/apps/" + Config.HEROKU.APP_NAME;

bot.addCommand(
  {
    pattern: "givesudo ?(.*)",
    fromMe: true,
    desc: "Give SUDO access to a person by replying to their message",
  },
  async (message, match) => {
    const vars = await heroku.get(baseURI + "/config-vars");
    const target = message.reply_message?.jid || message.mention[0] || match;
    const sudo = sudoFormat(`${vars.SUDO || ""},${target.split("@")[0]}`);

    try {
      await heroku.patch(baseURI + "/config-vars", { body: { SUDO: sudo } });
      await message.sendMessage(`New SUDO Numbers are: ${sudo}`);
    } catch (error) {
      await message.sendMessage("An error occurred while executing the command.");
    }
  }
);

bot.addCommand(
  {
    pattern: "delsudo ?(.*)",
    fromMe: true,
    desc: "Remove SUDO access of a person by replying or mentioning them",
  },
  async (message, match) => {
    const vars = await heroku.get(baseURI + "/config-vars");
    const target = message.reply_message?.jid || message.mention[0] || match;
    const sudo = sudoFormat(target.split("@")[0]);
    const newsudo = vars.SUDO.replace("," + sudo, "").replace(sudo, "");

    try {
      await heroku.patch(baseURI + "/config-vars", { body: { SUDO: newsudo } });
      await message.sendMessage(`New SUDO Numbers are: ${newsudo}`);
    } catch (error) {
      await message.sendMessage("An error occurred while executing the command.");
    }
  }
);

bot.addCommand(
  {
    pattern: "getsudo ?(.*)",
    fromMe: true,
    desc: "Show a list of SUDO-enabled numbers",
  },
  async (message, match) => {
    const vars = await heroku.get(baseURI + "/config-vars");
    const sudos = vars.SUDO || "";
    await message.sendMessage(`SUDO Numbers are: ${sudos}`);
  }
);
