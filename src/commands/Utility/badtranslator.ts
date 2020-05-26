import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'badtranslator',
  aliases: ['bt', 'badtranslate'],
  responseOptional: true,
  metadata: {
    description: 'Run text through a bad translator',
    usage: '<text>',
    examples: ['hello there']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 10000
  },
  args: [
    {
      name: 'hops',
      default: '6'
    }
  ],
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    await ctx.triggerTyping();
    if (!args || !args.badtranslator) {
      return ctx.editOrReply('You need to supply text to translate');
    }
    if (!ctx.client.isOwner(ctx.userId)) {
      const hops = parseInt(args.hops);
      if (isNaN(args.hops)) args.hops = 6;
      else if (hops > 10) args.hops = 10;
      else if (args.hops < 2) args.hops = 2;
      else args.hops = hops;
    }
    const response = await assyst.customRest.translate(args.badtranslator, parseInt(args.hops));
    return ctx.editOrReply(`Language chain: \`${response.chain.join(' -> ')}\`\n\nTranslation: ${Markup.codeblock(response.text, { limit: 1990 })}`);
  }
};
