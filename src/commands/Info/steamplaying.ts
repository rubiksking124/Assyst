import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'steamplaying',
  aliases: ['sp', 'steam'],
  responseOptional: true,
  metadata: {
    description: 'Get the amount of users playing a game on steam',
    usage: '[game]',
    examples: ['Dota 2']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.steamplaying) {
      return ctx.editOrReply('You need to provide a game to search for');
    }
    const response = await assyst.fapi.steamPlaying(args.steamplaying);
    return ctx.editOrReply(response);
  }
};
