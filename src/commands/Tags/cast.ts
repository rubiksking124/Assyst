import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'cast',
  aliases: ['test'],
  responseOptional: true,
  metadata: {
    description: 'Run text through the Cast tag parser',
    usage: '<text>',
    examples: ['{pi}']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.cast) {
      return ctx.editOrReply('You need to supply text to parse');
    }
    const result = await assyst.customRest.parseText(args.cast);
    const output = result.result.slice(0, 1900);
    return ctx.editOrReply(`${output.length > 0 ? output : '`⚠️ No Output`'}\n\n⏰ Time taken: \`${result.timeTaken}μs\`\n🔞 Nsfw: ${result.nsfw}\n📜 Imagescripts: ${result.imagescripts ? result.imagescripts.length : 0}\n📋 Attachments: ${result.attachments ? result.attachments.length : 0}`);
  }
};
