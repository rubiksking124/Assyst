import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

import { admins } from '../../../config.json';

export default {
  name: 'fblacklist',
  responseOptional: true,
  metadata: {
    description: 'Blacklist a user from feedback',
    usage: '<user id>',
    examples: ['1234567890']
  },
  onBefore: (ctx: Context) => ctx.client.isOwner(ctx.userId) || admins.includes(ctx.userId),
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if(!args || !args.fblacklist) {
      return ctx.editOrReply('pass a user id')
    }
    await assyst.db.addUserToFeedbackBlacklist(args.fblacklist);
    return ctx.editOrReply('user blacklisted')
  }
};
