import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

import { admins } from '../../../config.json';

export default {
  name: 'addadmin',
  aliases: ['aa'],
  responseOptional: true,
  metadata: {
    description: 'Add a guild admin',
    usage: '<user id>',
    examples: ['233667448887312385']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  onBefore: async (assyst: Assyst, ctx: Context) => { return ctx.client.isOwner(ctx.userId) || admins.includes(ctx.userId) || await assyst.utils.memberOwnsGuild(<string> ctx.guildId, ctx.userId); },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.addadmin) {
      return ctx.editOrReply('You need to supply a user id to add as an admin');
    }
    const guildId = <string> ctx.guildId;
    const userId: string = args.addadmin;
    try {
      const result = await Promise.all([ctx.rest.fetchUser(userId), assyst.db.checkIfUserIsGuildAdmin(guildId, userId)]);
      if (result[1] === true) {
        return ctx.editOrReply('This user is already a guild admin');
      }
    } catch (e) {
      if (!e.response) {
        throw new Error(e.message);
      }
      switch (e.response.statusCode) {
        case 404:
          return ctx.editOrReply('No user with this id exists');
        case 400:
          return ctx.editOrReply('Invalid user id supplied');
        default:
          throw new Error(e.message);
      }
    }
    await assyst.db.addGuildAdmin(guildId, userId);
    return ctx.editOrReply('User was added as an admin successfully');
  }
};
