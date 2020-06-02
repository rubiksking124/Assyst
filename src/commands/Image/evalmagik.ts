import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'evalmagik',
  aliases: ['evalm'],
  responseOptional: true,
  metadata: {
    description: 'Run an imagemagick script on an image',
    usage: '[script] <-img image>',
    examples: ['-implode -0.5']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 10000
  },
  args: [
    {
      name: 'img',
      default: undefined
    }
  ],
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.evalmagik) {
      return ctx.editOrReply('You need to provide a script to run on the image');
    }
    ctx.triggerTyping();
    let success = true;
    const imageUrl = await assyst.utils.getUrlFromChannel(ctx, args.img);
    if (!imageUrl) {
      return ctx.editOrReply('No valid image found or supplied');
    }
    const response = await assyst.fapi.evalMagik(imageUrl, args.evalmagik).catch((e) => {
      ctx.editOrReply(e.message);
      success = false;
    });
    if (typeof response === 'string') {
      return ctx.editOrReply(response);
    }
    if (success) return ctx.editOrReply({ file: { filename: 'evalmagik.png', data: response } });
    else return null;
  }
};
