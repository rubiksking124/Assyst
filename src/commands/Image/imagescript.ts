import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { ReturnTypes } from 'fapi-client/JS/src/types';

export default {
  name: 'imagescript',
  aliases: ['runis', 'is'],
  responseOptional: true,
  metadata: {
    description: 'Execute imagescript (Docs)[https://imagescript.dreadful.tech/]',
    usage: '[script]',
    examples: ['const image = Image.new(1024,1024); image.fill((x,y)=>x+y | Date.now() % (x+y))']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 1500
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.imagescript) {
      return ctx.editOrReply('You need to provide a script to run');
    }
    ctx.triggerTyping();
    const guildAttachmentLimitBytes = await ctx.rest.fetchGuild(<string> ctx.guildId).then(g => g.maxAttachmentSize);
    let response: ReturnTypes.ImageScript | undefined;
    try {
      response = await assyst.fapi.imageScript(args.imagescript);
    } catch (e) {
      return ctx.editOrReply(e.message);
    }
    if (response?.image && response?.image.length > guildAttachmentLimitBytes) {
      return ctx.editOrReply('Image too large to send');
    }
    return ctx.editOrReply({ file: { filename: 'imagescript.' + response?.format, data: response?.image }, content: `CPU Time: \`${response.cpuTime.toFixed(2)}\`ms\nWall Time: \`${response.wallTime.toFixed(2)}\`ms\nMemory Usage: \`${response.memoryUsage.toFixed(2)}\`MB` });
  }
};
