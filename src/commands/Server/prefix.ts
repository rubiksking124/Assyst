import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'prefix',
  responseOptional: true,
  metadata: {
    description: 'Get or set the guild prefix',
    usage: '<new prefix>',
    examples: ['', '-']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  args: [
    {
      name: 's',
      type: Boolean
    }
  ],
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const argsExist = args && args.prefix;
    const canSet = await assyst.checkIfUserIsGuildAdmin(ctx.guildId, ctx.userId) || ctx.client.isOwner(ctx.userId);
    if (!argsExist || !canSet) {
      let prefix = assyst.prefixCache.get(<string> ctx.guildId);
      if (!prefix) {
        prefix = await assyst.db.getGuildPrefix(<string> ctx.guildId);
      }
      return ctx.editOrReply(`The current guild prefix is \`${prefix}\``);
    } else {
      let prefix = args.prefix;
      if (prefix.length > 3) return ctx.editOrReply('The prefix needs to be less than 4 characters');
      if (args.s) prefix += ' ';
      assyst.prefixCache.set(<string> ctx.guildId, prefix);
      await assyst.db.updateGuildPrefix(prefix, <string> ctx.guildId);
      return ctx.editOrReply(`The new guild prefix is \`${prefix}\``);
    }
  }
};
