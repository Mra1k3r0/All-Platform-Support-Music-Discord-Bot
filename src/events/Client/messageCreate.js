const {
  Client,
  Message,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Permissions,
} = require("discord.js");

const { afk } = require("../../utils/afk");
const db = require("../../schema/prefix.js");
const i18n = require("../../utils/i18n");
const moment = require("moment");
const config = require("../../config.js");
const owner = config.ownerID;

module.exports = {
  name: "messageCreate",
  run: async (client, message) => {
    if (message.author.bot) return;
    const mentionedMember = message.mentions.members.first();
    if (mentionedMember) {
      const data = afk.get(mentionedMember.id);
      if (data) {
        const [timestamp, reason] = data;
        const timeAgo = moment(timestamp).fromNow();
        message.reply(
          `<@${mentionedMember.user.id}> is currently afk (${timeAgo}) - **${reason}**`,
        );
      }
    }
    const getData = afk.get(message.author.id);
    if (getData) {
      afk.delete(message.author.id);
      message.reply(
        `Welcome Back <@${message.author.id}>, I have removed your AFK`,
      );
    }

    if (message.author.bot) return;
    if (!message.guild) return;
    let prefix = client.prefix;

    const channel = message?.channel;
    const ress = await db.findOne({ Guild: message.guildId });
    if (ress && ress.Prefix) prefix = ress.Prefix;

    const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);

    var m = "";
    try {
      var p1 = message.client.manager.get(message.guild.id);
      if (!p1) m = "automatic";
      else {
        const ch = message.guild.channels.cache.get(p1.voiceChannel);
        m = ch.rtcRegion;
      }
    } catch (e) {}
    if (message.content.match(mention)) {
      const lawde = new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel("Invite")
          .setStyle("LINK")
          .setURL(
            `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=36768832&scope=applications.commands%20bot`,
          ),
        new MessageButton()
          .setLabel("Support")
          .setStyle("LINK")
          .setURL("https://discord.gg/ATZUc9rCuS"),
        new MessageButton()
          .setLabel("Vote")
          .setStyle("LINK")
          .setURL(`https://discord.gg/ATZUc9rCuS`),
      );
      const embed = new MessageEmbed()
        .setColor(client.embedColor)
        .setTitle(`Settingss For ${message.guild.name}`)
        .setFooter(
          `Made with 💖 By TEC`,
          message.guild.iconURL({ dynamic: true }),
        )
        .setThumbnail(
          "https://cdn.discordapp.com/emojis/1199357089395527723.webp?size=128&quality=lossless",
        )

        .setDescription(
          `**My prefix here is \`${prefix}\`\nVoice Region: \`${m}\`\nServer Id: \`${message.guild.id}\`\n\nType ${prefix}help to see all commands of Atomic**`,
          {
            Pre: prefix,
          },
        );
      message.channel.send({ embeds: [embed], components: [lawde] });
    }

    let np = [];

    let npdata = await client.db.get(`noprefix_${message.author.id}`);
    if (!npdata) {
      await client.db.set(`noprefix_${message.author.id}`, `false`);
    }
    if (npdata === "true") {
      np.push(message.author.id);
    }
    if (npdata === "false") {
      np = [];
    }
    let regex = new RegExp(`^<@!?${client.user.id}>`);
    let pre = message.content.match(regex)
      ? message.content.match(regex)[0]
      : prefix;
    if (!np.includes(message.author.id)) {
      if (!message.content.startsWith(pre)) return;
    }

    const args =
      np.includes(message.author.id) === false
        ? message.content.slice(pre.length).trim().split(/ +/)
        : message.content.startsWith(pre) === true
          ? message.content.slice(pre.length).trim().split(/ +/)
          : message.content.trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
      client.commands.get(commandName) ||
      client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName),
      );

    if (!command) return;
    if (command.voteonly) {
      let vote = await client.topgg.hasVoted(message.author.id);
      if (!vote) {
        let embed = new MessageEmbed()
          .setDescription(
            `${client.emoji.wrong} | **This Is A Vote Required Command So Vote Us Now By [Clicking Here](https://top.gg/bot/${client.user.id}/vote)**`,
          )
          .setColor(client.embedColor);
        return message.channel.send({ embeds: [embed] });
      }
    }
    if (!message.guild.me.permissions.has(Permissions.FLAGS.SEND_MESSAGES))
      return await message.author.dmChannel
        .send({
          content: `${i18n.__mf("events.msgcrt.embed2", {
            channelId: message.channel.id,
            cmdname: command.name,
          })}`,
        })
        .catch(() => {});

    if (!message.guild.me.permissions.has(Permissions.FLAGS.VIEW_CHANNEL))
      return;

    if (!message.guild.me.permissions.has(Permissions.FLAGS.EMBED_LINKS))
      return await message.channel
        .send({
          content: `${i18n.__mf("events.msgcrt.embed3", {
            cmdname: command.name,
          })}`,
        })
        .catch(() => {});

    const embed = new MessageEmbed().setColor(client.embedColor);

    // args: true,
    if (command.args && !args.length) {
      let reply = `${i18n.__("events.msgcrt.embed4")}`;

      // usage: '',
      if (command.usage) {
        reply += `\n\`${prefix}${command.name} ${command.usage}\``;
      }

      embed.setDescription(reply);
      return message.channel.send({ embeds: [embed] });
    }

    if (
      command.permission &&
      !message.member.permissions.has(command.permission)
    ) {
      embed.setDescription(i18n.__("prams.prams"));
      return message.channel.send({ embeds: [embed] });
    }
    if (
      !channel
        .permissionsFor(message.guild.me)
        ?.has(Permissions.FLAGS.EMBED_LINKS) &&
      client.user.id !== userId
    ) {
      return channel.send({ content: `${i18n.__("events.msgcrt.embed5")}` });
    }
    if (command.owner) {
      if (!owner.includes(message.author.id)) {
        embed.setDescription(
          `${client.emoji.wrong} | Only My Developers Can Use This Command`,
        );
        return message.channel.send({ embeds: [embed] });
      }
    }
    const player = message.client.manager.get(message.guild.id);

    if (command.player && !player) {
      embed.setDescription(i18n.__("player.nomusic"));
      return message.channel.send({ embeds: [embed] });
    }

    if (command.inVoiceChannel && !message.member.voice.channelId) {
      embed.setDescription(i18n.__("player.vcmust"));
      return message.channel.send({ embeds: [embed] });
    }

    if (command.sameVoiceChannel) {
      if (message.guild.me.voice.channel) {
        if (
          message.guild.me.voice.channelId !== message.member.voice.channelId
        ) {
          embed.setDescription(
            `${i18n.__("player.samevc")} ${message.guild.me.voice.channel}!`,
          );
          return message.channel.send({ embeds: [embed] });
        }
      }
    }

    try {
      command.execute(message, args, client, prefix);
    } catch (error) {
      console.log(error);
      embed.setDescription(i18n.__("player.cmderr"));
      return message.channel.send({ embeds: [embed] });
    }
  },
};
