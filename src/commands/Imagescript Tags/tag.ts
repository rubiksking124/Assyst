import { Context } from 'detritus-client/lib/command';

import { ReturnTypes } from 'fapi-client/JS/src/types';

import Assyst from '../../structures/Assyst';

export default {
  name: 'imagescripttag',
  aliases: ['ist'],
  responseOptional: true,
  priority: 1,
  metadata: {
    description: 'Run an ImageScript tag',
    usage: '[tag name]',
    examples: ['test']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args.imagescripttag) {
      return ctx.editOrReply('You need to supply a tag name');
    }
    const tags = await assyst.db.fetchImageScriptTag(args.imagescripttag).then(res => res.map(r => r.content));
    if (tags.length === 0) {
      return ctx.editOrReply('Tag not found');
    }
    const tag = tags[0];
    ctx.triggerTyping();
    const guildAttachmentLimitBytes = await ctx.rest.fetchGuild(<string> ctx.guildId).then(g => g.maxAttachmentSize);
    let response: ReturnTypes.ImageScript | undefined;
    try {
      response = await assyst.fapi.imageScript(tag);
    } catch (e) {
      return ctx.editOrReply(e.message);
    }
    if (response?.image && response?.image.length > guildAttachmentLimitBytes) {
      return ctx.editOrReply('Image too large to send');
    }
    return ctx.editOrReply({ file: { filename: 'imagescript.png', data: response?.image } });
  }
};
