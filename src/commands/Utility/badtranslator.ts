import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'badtranslator',
  aliases: ['bt','badtranslate'],
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
  run: async (assyst: Assyst, ctx: Context, args: any) => {
      await ctx.triggerTyping();
    if(!args || !args.badtranslator) {
        return ctx.editOrReply('You need to supply text to translate');
    }
    const response = await assyst.customRest.translate(args.badtranslator);
    return ctx.editOrReply(`Translation: \`${response.text}\`\nLanguage chain: \`${response.chain.join(' -> ')}\``);
  }
};
