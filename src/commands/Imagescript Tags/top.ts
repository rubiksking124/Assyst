import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'imagescripttag owner',
  aliases: ['ist owner'],
  responseOptional: true,
  priority: 2,
  metadata: {
    description: 'Fetch the owner of an ImageScript Tag',
    usage: '[tag name]',
    examples: ['test']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const top10Tags = await assyst.db.fetchTopImageScriptTags(10);
    return ctx.editOrReply(`**Top 10 tags by uses**\n${top10Tags.map(t => `**${t.name}** - ${t.uses} uses (owned by \`${t.owner}\`)`)}`)
  }
};
