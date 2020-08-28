import { Context } from 'detritus-client/lib/command';

import { Markup } from 'detritus-client/lib/utils';

import Assyst from '../../structures/Assyst';

export default {
  name: 'ocrbadtranslator',
  aliases: ['ocrbt'],
  responseOptional: true,
  metadata: {
    description: 'Perform OCR on an image and then pass it through Bad Translation',
    usage: '<image|url>',
    examples: ['https://link.to.my/image.png', '']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 10000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    await ctx.triggerTyping();
    const imageUrl = await assyst.utils.getUrlFromChannel(ctx, args ? args.ocr : undefined);
    if (!imageUrl) {
      return ctx.editOrReply('No valid image found or supplied');
    }
    let res;
    try {
      res = await assyst.customRest.ocr(imageUrl);
    } catch (e) {
      return ctx.editOrReply(e.message);
    }
    if (res.text.length === 0) {
      return ctx.editOrReply('No text detected');
    }
    const textToTranslate = res.text;
    const response = await assyst.customRest.translate(textToTranslate);
    return ctx.editOrReply(`Language chain: \`${response.chain.join(' -> ')}\`\n\nTranslation: ${Markup.codeblock(response.text, { limit: 1990 })}`);
  }
};
