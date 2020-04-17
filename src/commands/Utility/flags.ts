import { Context } from 'detritus-client/lib/command';

import { UserFlags } from 'detritus-client/lib/constants';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'publicflags',
  aliases: ['flags'],
  responseOptional: true,
  metadata: {
    description: 'Get your public flags',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 3000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const user = ctx.user;
    const publicFlags: Array<string> = [];
    for (let i = 0; i < 16; i++) {
      const flagName: string | undefined = UserFlags[1 << i];
      if (flagName) {
        publicFlags.push(`${flagName.slice(0, 1)}${flagName.slice(1).toLowerCase()}: ${(user.publicFlags & 1 << i) !== 0}`);
      }
    }
    ctx.editOrReply(Markup.codeblock(publicFlags.join('\n'), { language: 'ml' }));
  }
};
