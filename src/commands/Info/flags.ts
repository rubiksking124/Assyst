import { Context } from 'detritus-client/lib/command';

import { UserFlags } from 'detritus-client/lib/constants';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'publicflags',
  aliases: ['flags'],
  responseOptional: true,
  metadata: {
    description: 'Get your or someone else\'s public flags',
    usage: '<user id>',
    examples: ['', '233667448887312385']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  args: [{
    name: 'onlytrue',
    type: Boolean
  },
  {
    name: 'onlyfalse',
    type: Boolean
  }],
  run: async (_assyst: Assyst, ctx: Context, args: any) => {
    let user = ctx.user;
    if (args && args.publicflags) {
      try {
        user = await ctx.rest.fetchUser(args.publicflags);
      } catch (e) {
        if (e.response.statusCode === 400) {
          return ctx.editOrReply('User parameter must be a valid id');
        }
        return ctx.editOrReply(e.message);
      }
    }
    const publicFlags: Array<string> = [];
    for (let i = 0; i < 16; i++) {
      const flagName: string | undefined = UserFlags[1 << i];
      if (flagName) {
        const state = (user.publicFlags & 1 << i) !== 0;
        if ((args.onlytrue && state) || (!args.onlytrue && !args.onlyfalse) || (args.onlyfalse && !state)) {
          publicFlags.push(`${flagName.slice(0, 1)}${flagName.slice(1).toLowerCase()}: ${state}`);
        }
      }
    }
    if ((args.onlytrue && user.hasVerifiedDeveloper) || (!args.onlytrue && !args.onlyfalse) || (args.onlyfalse && !user.hasVerifiedDeveloper)) publicFlags.push(`Verified_bot_developer: ${user.hasVerifiedDeveloper}`);
    if ((args.onlytrue && user.hasVerifiedBot) || (!args.onlytrue && !args.onlyfalse) || (args.onlyfalse && !user.hasVerifiedBot)) publicFlags.push(`Verified_bot: ${user.hasVerifiedBot}`);
    ctx.editOrReply(Markup.codeblock(publicFlags.join('\n'), { language: 'ml' }));
  }
};
