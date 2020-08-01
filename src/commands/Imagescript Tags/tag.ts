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
    duration: 1500
  },
  args: [
    {
      name: 'm',
      type: Boolean
    }
  ],
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args.imagescripttag) {
      return ctx.editOrReply('You need to supply a tag name');
    }
    const [name, ...passedArgs] = args.imagescripttag.split(' ');
    const tags = await assyst.db.fetchImageScriptTag(name).then(res => res.map(r => r.content));
    if (tags.length === 0) {
      return ctx.editOrReply('Tag not found');
    }
    const tag = tags[0];
    ctx.triggerTyping();
    const guildAttachmentLimitBytes = await ctx.rest.fetchGuild(<string> ctx.guildId).then(g => g.maxAttachmentSize);
    let response: ReturnTypes.ImageScript | undefined;
    try {
      response = await assyst.fapi.imageScript(tag, {
        args: passedArgs.join(' '),
        avatar: ctx.user.avatarUrl
      });
    } catch (e) {
      return ctx.editOrReply(e.message);
    }
    if (response?.image && response?.image.length > guildAttachmentLimitBytes) {
      const url = await assyst.customRest.uploadToTsu(response.image, 'image/png');
      return ctx.editOrReply({ content: (args.m ? `CPU Time: \`${response.cpuTime}\`ms\nWall Time: \`${response.wallTime}\`ms\nMemory Usage: \`${response.memoryUsage}\`MB\n` : '') + url });
    }
    await assyst.db.incrementImageScriptTagUses(name);
    return ctx.editOrReply({ content: args.m ? `CPU Time: \`${response.cpuTime.toFixed(2)}\`ms\nWall Time: \`${response.wallTime.toFixed(2)}\`ms\nMemory Usage: \`${response.memoryUsage.toFixed(2)}\`MB` : '', file: { filename: 'imagescript.png', data: response?.image } });
  }
};
