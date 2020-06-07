import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

import { admins } from '../../../config.json';

export default {
  name: 'commandlog',
  aliases: ['cl'],
  responseOptional: true,
  metadata: {
    description: 'Set, get or delete the command log channel',
    usage: '<delete|[channel id]>',
    examples: ['delete', '700323509687287869']
  },
  ratelimit: {
    type: '',
    limit: 1,
    duration: 5000
  },
  onBefore: async (assyst: Assyst, ctx: Context) => {
    return ctx.client.isOwner(ctx.userId) || admins.includes(ctx.userId) || await assyst.db.checkIfUserIsGuildAdmin(<string> ctx.guildId, ctx.userId) || ctx.member?.isOwner;
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.commandlog) {
      const channelId = await assyst.db.getCommandLogChannel(<string> ctx.guildId);
      if (!channelId) return ctx.editOrReply('No command log channel is set');
      const channel = await ctx.rest.fetchChannel(channelId);
      return ctx.editOrReply(`The command log channel is ${channel.name}`);
    } else if (args.commandlog === 'delete') {
      await assyst.db.deleteCommandLogChannel(<string> ctx.guildId);
      return ctx.editOrReply('The command log channel was deleted');
    } else {
      const channelId = args.commandlog;
      try {
        await ctx.rest.fetchChannel(channelId);
      } catch (e) {
        if (e.response && e.response.statusCode === 400) {
          return ctx.editOrReply('Invalid channel id');
        }
        return ctx.editOrReply(e.message);
      }
      await assyst.db.setCommandLogChannel(<string> ctx.guildId, channelId);
      return ctx.editOrReply('Command log channel set');
    }
  }
};
