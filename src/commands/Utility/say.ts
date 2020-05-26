import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'say',
  aliases: ['echo'],
  responseOptional: true,
  metadata: {
    description: 'Repeats user input',
    usage: '<text>',
    examples: ['bruh']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 2500
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const content = args.say;
    if (!content) {
      return ctx.editOrReply('You need to supply text to repeat');
    }
    return ctx.editOrReply({ content, allowedMentions: { parse: [] } });
  }
};
