import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

import { admins } from '../../../config.json';

export default {
  name: 'removeadmin',
  aliases: ['ra'],
  responseOptional: true,
  metadata: {
    description: 'Remove a guild admin',
    usage: '<user id>',
    examples: ['233667448887312385']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  onBefore: (assyst: Assyst, ctx: Context) => { return ctx.client.isOwner(ctx.userId) || admins.includes(ctx.userId) || ctx.member?.isOwner; },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.removeadmin) {
      return ctx.editOrReply('You need to supply a user id to remove as an admin');
    }
    const guildId = <string> ctx.guildId;
    const userId: string = args.removeadmin;
    const isGuildAdmin = await assyst.db.checkIfUserIsGuildAdmin(guildId, userId);
    if (!isGuildAdmin) {
      return ctx.editOrReply('This user is not a guild admin');
    }
    await assyst.db.removeGuildAdmin(guildId, userId);
    return ctx.editOrReply('User was removed as an admin successfully');
  }
};
