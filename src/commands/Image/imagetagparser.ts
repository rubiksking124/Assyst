import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'imagetagparser',
  aliases: ['runitp'],
  responseOptional: true,
  metadata: {
    description: 'Execute imagescript ([Docs](https://gist.github.com/matmen/d4fa000110efe2944078fb8065dafd11))',
    usage: '[script]',
    examples: ['load image myimg\nexplode myimg\nrender myimg']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 10000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.imagetagparser) {
      return ctx.editOrReply('You need to provide a script to run');
    }
    ctx.triggerTyping();
    let success = true;
    const response = await assyst.fapi.imageTagParser(args.imagetagparser).catch((e) => {
      ctx.editOrReply(e.message);
      success = false;
    });
    if (typeof response === 'string') {
      return ctx.editOrReply(response);
    }
    if (success) return ctx.editOrReply({ file: { filename: 'imagescript.png', data: response } });
    else return null;
  }
};
