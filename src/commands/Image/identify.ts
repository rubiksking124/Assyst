import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

const identifyApi: string = 'https://captionbot.azurewebsites.net/api/messages?language=en-US';

export default {
  name: 'identify',
  aliases: ['id'],
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
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    await ctx.triggerTyping();
    const imageUrl = await assyst.utils.getUrlFromChannel(ctx, args ? args.ocr : undefined);
    if (!imageUrl) {
      return ctx.editOrReply('No valid image found or supplied');
    }
    let success: boolean = true;
    const res = await assyst.customRest.request({
      url: identifyApi,
      body: {
        Type: 'CaptionRequest',
        Content: imageUrl
      },
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    }).catch((e) => { ctx.editOrReply(e.message); success = false; });
    if (success) return ctx.editOrReply(Markup.codeblock(res, { limit: 1990 }));
    else return null;
  }
};
