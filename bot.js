/* Copyright (C) 2020 Yusuf Usta.

Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.

WhatsAsena - Yusuf Usta
*/

blowfish.encrypt('const fs = require("fs")
const path = require("path")
const { handleMessages } = require("./Utilis/msg")
const chalk = require("chalk")
const { DataTypes } = require("sequelize")
const config = require("./config")
const { default: WAConnection, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore } = require("@adiwajshing/baileys")
const { state, saveState } = useSingleFileAuthState(`./session.json`)
const { StringSession } = require("./Utilis/whatsasena")
const { getJson } = require("./Utilis/download")
const { customMessageScheduler } = require("./Utilis/schedule")
const { prepareGreetingMedia } = require("./Utilis/greetings")
const { groupMuteSchuler, groupUnmuteSchuler } = require("./Utilis/groupmute")
const { PluginDB } = require("./plugins/sql/plugin")

const got = require("got")
const { startMessage, waWebVersion } = require("./Utilis/Misc")
const WhatsAsenaDB = config.DATABASE.define("WhatsAsena", {
  info: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
})

fs.readdirSync("./plugins/sql/").forEach((plugin) => {
  if (path.extname(plugin).toLowerCase() == ".js") {
    require("./plugins/sql/" + plugin)
  }
})

String.prototype.format = function () {
  var i = 0,
    args = arguments
  return this.replace(/{}/g, function () {
    return typeof args[i] != "undefined" ? args[i++] : ""
  })
}

if (!Date.now) {
  Date.now = function () {
    return new Date().getTime()
  }
}

Array.prototype.remove = function () {
  var what,
    a = arguments,
    L = a.length,
    ax
  while (L && this.length) {
    what = a[--L]
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1)
    }
  }
  return this
}

async function bot () {
  await config.DATABASE.sync();
    const bot = WAConnection({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: ['WhatsApp-Bot-Md','Safari','1.0.0'],
        auth: state
    });
    
    conn.logger.level = config.DEBUG ? 'debug' : 'warn';
    var nodb;   
    nodb = true;

        conn.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update	    
        if (connection === 'close') {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode
            if (reason === DisconnectReason.badSession) { console.log(`Bad Session File, Please Delete Session and Scan Again`); bot.logout(); }
            else if (reason === DisconnectReason.connectionClosed) { console.log("Connection closed, reconnecting...."); startbot(); }
            else if (reason === DisconnectReason.connectionLost) { console.log("Connection Lost from Server, reconnecting..."); startbot(); }
            else if (reason === DisconnectReason.connectionReplaced) { console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); bot.logout(); }
            else if (reason === DisconnectReason.loggedOut) { console.log(`Device Logged Out, Please Scan Again And Run.`); bot.logout(); }
            else if (reason === DisconnectReason.restartRequired) { console.log("Restart Required, Restarting..."); startbot(); }
            else if (reason === DisconnectReason.timedOut) { console.log("Connection TimedOut, Reconnecting..."); startbot(); }
            else bot.end(`Unknown DisconnectReason: ${reason}|${connection}`)
        }
        console.log(
            chalk.green.bold('session restored ✅ !')
        );
        console.log('Connected...', update)
    })

    conn.on('creds.update', saveState)
    

    conn.on('open', async () => {
        console.log(
            chalk.green.bold('✅ Login successful!')
    console.log(chalk.blueBright.italic("⬇️ Installing external plugins..."))
    console.log(chalk.blueBright.italic("✅ Login information updated!"))

    let plugins = await PluginDB.findAll()
    plugins.map(async (plugin) => {
      try {
        if (!fs.existsSync("./plugins/" + plugin.dataValues.name + ".js")) {
          console.log(plugin.dataValues.name)
          let response = await got(plugin.dataValues.url)
          if (response.statusCode == 200) {
            fs.writeFileSync(
              "./plugins/" + plugin.dataValues.name + ".js",
              response.body
            )
            require("./plugins/" + plugin.dataValues.name + ".js")
          }
        }
      } catch (error) {
        console.log(
          `failed to load external plugin : ${plugin.dataValues.name}`
        )
      }
    })
    console.log(chalk.blueBright.italic("⬇️  Installing plugins..."))

    fs.readdirSync("./plugins").forEach((plugin) => {
      if (path.extname(plugin).toLowerCase() == ".js") {
        require("./plugins/" + plugin)
      }
    })

    console.log(chalk.green.bold("✅ Plugins installed!"))
    await conn.sendMessage(
      conn.user.jid,
      await startMessage(),
      MessageType.text,
      { detectLinks: false }
    )
  })
  conn.on("close", (e) => console.log(e.reason))

  await groupMuteSchuler(conn)
  await groupUnmuteSchuler(conn)
  await customMessageScheduler(conn)

  conn.on("chat-update", (m) => {
    if (!m.hasNewMessage) return
    if (!m.messages && !m.count) return
    const { messages } = m
    const all = messages.all()
    handleMessages(all[0], conn)
  })

  try {
    await conn.connect()
  } catch (e) {
    if (!nodb) {
      console.log(chalk.red.bold("Eski sürüm stringiniz yenileniyor..."))
      conn.loadAuthInfo(Session.deCrypt(config.SESSION))
      try {
        await conn.connect()
      } catch (e) {
        return
      }
    } else console.log(`${e.message}`)
  }
}

;(async () => {
  await prepareGreetingMedia()
  whatsAsena(await waWebVersion())
})()', 'WhatsAsena', {cipherMode: 0, outputType: 0});
