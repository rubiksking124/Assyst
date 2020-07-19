import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'imagescripttag top',
  aliases: ['ist top'],
  responseOptional: true,
  priority: 2,
  metadata: {
    description: 'Fetch the top 10 most used ImageScript tags',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const top10Tags = await assyst.db.fetchTopImageScriptTags(10);
    return ctx.editOrReply({ 
        content: `**Top 10 tags by uses**\n${top10Tags.map(t => `**${t.name}** - ${t.uses} uses (owned by <@${t.owner}>)`).join('\n')}`,
        allowedMentions: { parse: [] }
    })
  }
};
