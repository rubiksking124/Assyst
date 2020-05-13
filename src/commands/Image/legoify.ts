import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

const identifyApi: string = '';

export default {
  name: 'legoify',
  aliases: ['lego'],
  responseOptional: true,
  metadata: {
    description: 'Identify an image',
    usage: '<image|url>',
    examples: ['https://link.to.my/image.png', '']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 7500
  },
  args: [
    {
      name: 'res',
      default: '20'
    }
  ],
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    await ctx.triggerTyping();
    const imageUrl = await assyst.utils.getUrlFromChannel(ctx, args ? args.legoify : undefined);
    if (!imageUrl) {
      return ctx.editOrReply('No valid image found or supplied');
    }
    const res = await assyst.customRest.legoifyImage(imageUrl, args.res);
    if (typeof res === 'string') {
      return ctx.editOrReply(res);
    }
    return ctx.editOrReply({ file: { filename: 'lego.png', data: res } });
  }
};
