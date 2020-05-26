import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { MetricItem } from '../../structures/Utils';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'limits',
  aliases: ['guildlimits'],
  responseOptional: true,
  metadata: {
    description: 'Fetch the guild value limit information',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: '5000',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const guild = await ctx.rest.fetchGuild(<string> ctx.guildId);
    const memberLimit = guild.maxMembers.toString();
    const presenceLimit = guild.maxPresences.toString();
    const emojiLimit = guild.maxEmojis.toString();
    const videoLimit = guild.maxVideoChannelUsers.toString();
    const bitrateLimit = guild.maxBitrate.toString();
    const attachmentLimit = guild.maxAttachmentSize.toString();
    const fields: MetricItem[] = [
      {
        name: 'Members:',
        value: memberLimit
      },
      {
        name: 'Presences:',
        value: presenceLimit
      },
      {
        name: 'Emojis:',
        value: emojiLimit
      },
      {
        name: 'VideoChannelMembers:',
        value: videoLimit
      },
      {
        name: 'Bitrate:',
        value: `${parseInt(bitrateLimit) / 1000} kbps`
      },
      {
        name: 'AttachmentSize:',
        value: `${parseInt(attachmentLimit) / 1024 / 1024} MB`
      }
    ];
    return ctx.editOrReply({
      embed: {
        title: 'Guild Limits',
        author: {
          name: guild.name,
          iconUrl: guild.iconUrl || ''
        },
        description: Markup.codeblock(assyst.utils.formatMetricList(fields), { limit: 1990, language: 'ml' }),
        color: 0xe39117
      }
    });
  }
};
