import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { admins } from '../../../config.json';

export default {
  name: 'clean',
  responseOptional: true,
  metadata: {
    description: 'Clean up commands in a channel',
    usage: '<amount>',
    examples: ['', '100']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  onBefore: async (assyst: Assyst, ctx: Context) => {
    return ctx.client.isOwner(ctx.userId) || admins.includes(ctx.userId) || await assyst.db.checkIfUserIsGuildAdmin(<string> ctx.guildId, ctx.userId);
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    let limit = 50;
    if (args && args.clean) {
      const limitCanBeSet = !isNaN(args.clean);
      if (limitCanBeSet) {
        const limitToBeSet = parseInt(args.clean);
        if (limitToBeSet > 1000) limit = 1000;
        else if (limitToBeSet < 1) limit = 1;
        else limit = limitToBeSet;
      } else {
        return ctx.editOrReply('You provided an invalid limit');
      }
    }
    const channelReplies = assyst.replies.filter(r => r.context.channelId === ctx.channelId && !r.reply.deleted).slice(0, limit);
    console.log(channelReplies.length);
    const sourceMessageIds = channelReplies.map(r => r.context.messageId);
    const replyMessageIds = channelReplies.map(r => r.reply.id);
    const messageIds = [...replyMessageIds, ...sourceMessageIds];
    if (messageIds.length === 0) {
      return ctx.editOrReply('No messages found');
    }
    await ctx.triggerTyping();
    await ctx.rest.bulkDeleteMessages(ctx.channelId, messageIds);
    return await ctx.editOrReply(`${messageIds.length} messages cleaned`).then((res) => {
      setTimeout(async () => {
        await ctx.rest.bulkDeleteMessages(ctx.channelId, [res.id, ctx.messageId]);
      }, 2500);
    });
  }
};
