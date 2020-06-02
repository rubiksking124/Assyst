import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'undo',
  responseOptional: true,
  metadata: {
    description: 'Undo the previous command invocation(s)',
    usage: '<amount>',
    examples: ['3', '']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    let amount = 1;
    if (args && args.undo && !isNaN(args.undo)) {
      amount = parseInt(args.undo);
      if (amount > 5) amount = 5;
      else if (amount < 1) amount = 1;
    }
    const allRecentInvocations = assyst.replies.filter(r => r.context.userId === ctx.userId && r.context.channelId === ctx.channelId && !r.reply.deleted);
    const recentInvocations = allRecentInvocations.slice(allRecentInvocations.length - amount);
    const messageIds = [...recentInvocations.map(r => r.reply.id), ...recentInvocations.map(r => r.context.message.id)];
    try {
      await ctx.rest.bulkDeleteMessages(ctx.channelId, messageIds);
      if (recentInvocations.length === 0) {
        return ctx.editOrReply('No recent commands found').then((res) => {
          setTimeout(async () => await ctx.rest.bulkDeleteMessages(ctx.channelId, [res.id, ctx.messageId]).catch(() => 1), 2500);
        });
      }
    } catch (e) {
      return ctx.editOrReply(e.message);
    }
    return ctx.editOrReply(`${messageIds.length} messages deleted`).then((res) => {
      setTimeout(async () => await ctx.rest.bulkDeleteMessages(ctx.channelId, [res.id, ctx.messageId]), 2500);
    });
  }
};
