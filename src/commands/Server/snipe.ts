import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { ChannelGuildText } from 'detritus-client/lib/structures';
import MessageSnipe from '../../structures/MessageSnipe';

export default {
  name: 'snipe',
  responseOptional: true,
  metadata: {
    description: 'Fetch the most recently deleted message from a channel',
    usage: '<channel mention|id>',
    examples: ['#general', '', '706974178171027459']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    let channel: ChannelGuildText | undefined;
    let snipe: MessageSnipe | undefined;
    try {
      if (!args || !args.snipe) {
        channel = await ctx.rest.fetchChannel(ctx.message.channelId);
      } else if (args.snipe.includes('#')) {
        const channelId: string = args.snipe.replace(/[<#|>]/g, '');
        if (channelId.split(' ').length > 1) {
          return ctx.editOrReply('Your channel mention is invalid');
        }
      }
      if (!channel) {
        return ctx.editOrReply('Channel not found')
      }
      snipe = assyst.messageSnipeController.findRecentSnipeFromChannelId(channel.id);
      if (!snipe) {
        return ctx.editOrReply('No snipes recorded in this channel')
      }
    } catch (e) {
      return ctx.editOrReply(e.message)
    }
    return ctx.editOrReply({
      content: `\`${snipe.author.username}#${snipe.author.discriminator}\`: ${snipe.content}`, allowedMentions:
        { parse: [] }
    })
  }
};
