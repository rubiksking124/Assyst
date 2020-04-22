import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { ChannelGuildText, Message, User, Member } from 'detritus-client/lib/structures';

import { ShardClient } from 'detritus-client';
import { MetricItem } from '../../structures/Utils';
import { EmptyBaseCollection, BaseCollection } from 'detritus-client/lib/collections';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'messageinfo',
  aliases: ['mi'],
  responseOptional: true,
  metadata: {
    description: 'Gets information about a message',
    usage: '[message id]',
    examples: ['702098447712518248', '702098447712518248 -c 583276705376894986']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  args: [
    {
      name: 'c',
      type: String,
      default: ''
    }
  ],
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.messageinfo) return ctx.editOrReply('Message parameter must be a valid id');
    let channel: ChannelGuildText | undefined;
    if (args && args.c) {
      channel = (<ShardClient> assyst.client).channels.get(args.c);
      if (!channel) {
        try {
          channel = await ctx.rest.fetchChannel(args.c);
        } catch (e) {
          if (e.statusCode !== 400) return ctx.editOrReply(e.message);
          else return ctx.editOrReply('Channel parameter must be a valid id');
        }
      }
    } else {
      channel = <ChannelGuildText> ctx.channel;
    }

    let message: Message | undefined;
    message = (<ShardClient> assyst.client).messages.get(args.messageinfo);
    if (!message) {
      try {
        message = await ctx.rest.fetchMessage(channel.id, args.messageinfo);
      } catch (e) {
        if (e.statusCode !== 400) return ctx.editOrReply(e.message);
        else return ctx.editOrReply('Message parameter must be a valid id');
      }
    }

    const rows: MetricItem[] = [];
    Object.entries(message).forEach((entry) => {
      const name = entry[0] + ':';
      let value = entry[1];
      if (value instanceof EmptyBaseCollection) {
        value = 'None';
      } else if (value instanceof BaseCollection) {
        value = value.size;
      } else if (value instanceof User) {
        value = value.username;
      } else if (value instanceof Member || name.startsWith('_') || name === 'client:') {
        return;
      }
      if (value === undefined) return;
      rows.push({
        name: name.slice(0, 1).toUpperCase() + name.slice(1),
        value: value.toString()
      });
    });

    return ctx.editOrReply({
      embed: {
        title: `Message info: ${args.messageinfo}`,
        description: Markup.codeblock(assyst.utils.formatMetricList(rows), {
          language: 'ml',
          limit: 1990
        }),
        color: 0x03ffb3
      }
    });
  }
};
