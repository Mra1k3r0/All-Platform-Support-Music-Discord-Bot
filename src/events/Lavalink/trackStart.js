const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
} = require("discord.js");
const { convertTime } = require("../../utils/convert.js");
const i18n = require("../../utils/i18n");

module.exports = async (client, player, track, payload) => {
  const song = player.queue.current;

  const thing = new MessageEmbed()
    .setAuthor({ name: `NOW PLAYING`, iconURL: client.emoji.nowplaying })
    .setDescription(`[${track.title}](${track?.uri ?? queue.uri})`)
    .setFooter({
      text: `Requested by: ${song.requester.username} | Duration: ${convertTime(track.duration)}`,
      iconURL: client.user.displayAvatarURL(),
    })
    .setImage(`https://img.youtube.com/vi/${track.identifier}/mqdefault.jpg`)
    .setColor(client.embedColor)
    .setTimestamp();

  const rowFilter = new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId("disable_h")
      .setPlaceholder(`Select Filters`)
      .addOptions([
        {
          label: "Reset Filters",
          value: "clear_but",
          emoji: "🎶",
        },
        {
          label: "BassBoost",
          value: "bass_but",
          emoji: "🎶",
        },
        {
          label: "8D",
          value: "8d_but",
          emoji: "🎶",
        },
        {
          label: "NightCore",
          value: "night_but",
          emoji: "🎶",
        },
        {
          label: "Pitch",
          value: "pitch_but",
          emoji: "🎶",
        },
        {
          label: "Distort",
          value: "distort_but",
          emoji: "🎶",
        },
        {
          label: `Equalizer`,
          value: "eq_but",
          emoji: "🎶",
        },
        {
          label: "Speed",
          value: "speed_but",
          emoji: "🎶",
        },
        {
          label: "Vaporwave",
          value: "vapo_but",
          emoji: "🎶",
        },
      ]),
  );

  const But1 = new MessageButton()
    .setEmoji("🔉")
    .setCustomId("vdown")
    .setStyle("SECONDARY");
  const But2 = new MessageButton()
    .setEmoji("⏹️")
    .setCustomId("stop")
    .setStyle("SECONDARY");
  const But3 = new MessageButton()
    .setCustomId("pause")
    .setEmoji("⏸️")
    .setStyle("SECONDARY");
  const But4 = new MessageButton()
    .setCustomId("skip")
    .setEmoji("⏭️")
    .setStyle("SECONDARY");
  const But5 = new MessageButton()
    .setCustomId("vup")
    .setEmoji("🔊")
    .setStyle("SECONDARY");

  const But6 = new MessageButton()
    .setEmoji("👤")
    .setStyle("LINK")
    .setLabel(`${track.author}`)
    .setURL(`${track?.uri ?? queue.uri}`);
  const But7 = new MessageButton()
    .setEmoji("👤")
    .setStyle("LINK")
    .setLabel(`${song.requester.username}`)
    .setURL(`https://discord.com/users/${song.requester.id}`);
  const But8 = new MessageButton()
    .setEmoji("🎶")
    .setStyle("LINK")
    .setLabel(`Invite ${client.user.username}`)
    .setURL(
      `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=36768832&scope=applications.commands%20bot`,
    );

  const row1 = new MessageActionRow().addComponents(
    But1,
    But2,
    But3,
    But4,
    But5,
  );
  const row2 = new MessageActionRow().addComponents(But6, But7, But8);

  let NowPlaying = await client.channels.cache
    .get(player.textChannel)
    .send({ embeds: [thing], components: [rowFilter, row1] });
  player.setNowplayingMessage(NowPlaying);

  const embed = new MessageEmbed().setColor(client.embedColor).setTimestamp();

  const collector = NowPlaying.createMessageComponentCollector({
    filter: (b) => {
      if (
        b.guild.me.voice.channel &&
        b.guild.me.voice.channelId === b.member.voice.channelId
      )
        return true;
      else {
        b.reply({
          content: `${i18n.__mf("but.vcmst", { Vc: b.guild.me.voice.channel })}`,
          ephemeral: true,
        });
        return false;
      }
    },
    time: track.duration,
  });

  collector.on("collect", async (i) => {
    await i.deferReply({
      ephemeral: true,
    });

    if (i.customId === "vdown") {
      if (!player) {
        return collector.stop();
      }
      let amount = Number(player.volume) - 10;
      await player.setVolume(amount);
      i.editReply({
        embeds: [
          embed
            .setAuthor({
              name: i.member.user.tag,
              iconURL: i.member.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(
              `${"🔊"} ${i18n.__("cmd.vol.embed")} **${amount}**`,
            ),
        ],
      }).then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 10000);
      });
    } else if (i.customId === "stop") {
      if (!player) {
        return collector.stop();
      }
      await player.stop();
      await player.queue.clear();
      i.editReply({
        embeds: [
          embed
            .setAuthor({
              name: i.member.user.tag,
              iconURL: i.member.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`${"⏹️"} ${i18n.__("cmd.stop.embed")}`),
        ],
      }).then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 10000);
      });
      return collector.stop();
    } else if (i.customId === "pause") {
      if (!player) {
        return collector.stop();
      }
      player.pause(!player.paused);
      const Text = player.paused ? `${"⏸️"} **Paused**` : `${"▶️"} **Resumed**`;
      i.editReply({
        embeds: [
          embed
            .setAuthor({
              name: i.member.user.tag,
              iconURL: i.member.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(
              `${Text} \n[${player.queue.current.title}](${player.queue.current.uri})`,
            ),
        ],
      }).then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 10000);
      });
    } else if (i.customId === "skip") {
      if (!player) {
        return collector.stop();
      }
      await player.stop();
      i.editReply({
        embeds: [
          embed
            .setAuthor({
              name: i.member.user.tag,
              iconURL: i.member.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(
              `${"⏭️"} ${i18n.__("cmd.skip.embed")}\n[${player.queue.current.title}](${track?.uri ?? queue.uri})`,
            ),
        ],
      }).then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 10000);
      });
      if (track.length === 1) {
        return collector.stop();
      }
    } else if (i.customId === "vup") {
      if (!player) {
        return collector.stop();
      }
      let amount = Number(player.volume) + 10;
      if (amount >= 150)
        return i
          .editReply({
            embeds: [
              embed
                .setAuthor({
                  name: i.member.user.tag,
                  iconURL: i.member.user.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(`${i18n.__("cmd.vol.embed2")}`),
            ],
          })
          .then((msg) => {
            setTimeout(() => {
              msg.delete();
            }, 10000);
          });
      await player.setVolume(amount);
      i.editReply({
        embeds: [
          embed
            .setAuthor({
              name: i.member.user.tag,
              iconURL: i.member.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(
              `${"🔊"} ${i18n.__("cmd.vol.embed")} **${amount}**`,
            ),
        ],
      }).then((msg) => {
        setTimeout(() => {
          msg.delete();
        }, 10000);
      });
      return;
    } else if (i.values[0] === "clear_but") {
      await player.clearEffects();
      await i.editReply({
        content: `${"❌"} Succesfully Cleared All **FILTERS**`,
      });
    } else if (i.values[0] === "bass_but") {
      await player.setBassboost(true);
      await i.editReply({ content: `${"🎶"} BassBoost mode **ENABLED**` });
    } else if (i.values[0] === "8d_but") {
      await player.set8D(true);
      await i.editReply({ content: `${"🎶"} 8D Mode **ENABLED**` });
    } else if (i.values[0] === "night_but") {
      await player.setNightcore(true);
      await i.editReply({ content: `${"🎶"} NightCore Mode **ENABLED**` });
    } else if (i.values[0] === "pitch_but") {
      await player.setPitch(2);
      await i.editReply({ content: `${"🎶"} Pitch Mode **ENABLED**` });
    } else if (i.values[0] === "distort_but") {
      await player.setDistortion(true);
      await i.editReply({ content: `${"🎶"} Distort Mode **ENABLED**` });
    } else if (i.values[0] === "eq_but") {
      await player.setEqualizer(true);
      await i.editReply({ content: `${"🎶"} Equalizer mode **ENABLED**` });
    } else if (i.values[0] === "speed_but") {
      await player.setSpeed(2);
      await i.editReply({ content: `${"🎶"} Speed Mode **ENABLED**` });
    } else if (i.values[0] === "vapo_but") {
      await player.setVaporwave(true);
      await i.editReply({ content: `${"🎶"} VaporWave Mode **ENABLED**` });
    }
  });
};
