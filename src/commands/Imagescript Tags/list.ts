import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'imagescripttag list',
  aliases: ['ist list'],
  responseOptional: true,
  priority: 2,
  metadata: {
    description: 'Fetch a user\'s ImageScript tags',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const userId = args['imagescripttag list'] || ctx.userId;
    const tags = await assyst.db.fetchUserImageScriptTags(userId);
    if (tags.length === 0) { return ctx.editOrReply('No tags found'); }
    const formattedTags = tags.sort((a, b) => a.split('')[0].charCodeAt(0) - b.split('')[0].charCodeAt(0)).map(t => `\`${Markup.escape.all(t)}\``).join(', ');
    return ctx.editOrReply({ content: `**Tag List: <@${userId}>**\n${formattedTags}`, allowedMentions: { parse: [] } });
  }
};
