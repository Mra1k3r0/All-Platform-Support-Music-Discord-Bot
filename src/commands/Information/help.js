const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
} = require("discord.js");

const emojiMap = {
  arrow: "➡️",
  about: "ℹ️",
  music: "🎵",
  owner: "👑",
  utility: "🛠️",
  config: "⚙️",
  allcmd: "🤖",
};

module.exports = {
  name: "help",
  category: "Information",
  aliases: ["h"],
  description: "Get Help Menu",
  args: false,
  usage: "",
  permission: [],
  owner: false,
  execute: async (message, args, client, prefix) => {
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
      /*new MessageButton()
        .setLabel("Vote")
        .setStyle("LINK")
        .setURL(`https://discord.gg`),*/
    );

    let helpmenu = new MessageEmbed()
      .setAuthor({
        name: `${client.user.username} Help Menu;`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(
        `> <:flowerblue:1201529459086463029>Prefix for this server is:  **${prefix}**\n > <:flowerblue:1201529459086463029>Total Commands: ${client.commands.size}\n\n 
      **__All Modules:__**\n${emojiMap.about} : **Info**\n${emojiMap.music} : **Music**\n${emojiMap.utility} : **Utility**\n${emojiMap.config} : **Config**\n${emojiMap.allcmd} : **All Commands**`,
      )
      .setFooter({
        text: `Thanks For Using ${client.user.username}!`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setColor(client.embedColor)
      .setImage(emojiMap.banner);

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("help")
        .setPlaceholder("Select Module To Get Help For That Module")
        .addOptions([
          {
            label: "Info",
            description: "Show You Information Commands",
            value: "first",
            emoji: emojiMap.about,
          },
          {
            label: "Music",
            description: "Show You Music Commands",
            value: "second",
            emoji: emojiMap.music,
          },
          {
            label: "Utility",
            description: "Show You Utility Commands",
            value: "sixth",
            emoji: emojiMap.utility,
          },
          {
            label: "Config",
            description: "Show You Configuration Commands",
            value: "fifth",
            emoji: emojiMap.config,
          },
          {
            label: "All Commands",
            description: "Show You All Commands",
            value: "third",
            emoji: emojiMap.allcmd,
          },
        ]),
    );
    if (!args[0])
      return message.reply({ embeds: [helpmenu], components: [row, lawde] });
  },
};
