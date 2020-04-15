import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'tag',
  aliases: ['t'],
  responseOptional: true,
  metadata: {
    description: 'Run a tag',
    usage: '[tag name] <tag args...>',
    examples: ['help', 'test {choose:hello|bye}']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.tag) {
      return ctx.editOrReply('You need to provide a tag name to run');
    }
    const tag = await assyst.db.getTag(<string> ctx.guildId, args.tag.split(' ')[0]);
    if (!tag) {
      return ctx.editOrReply('No tag found');
    }
    ctx.triggerTyping();
    const tagArgs = args.tag.split(' ').slice(1);
    const result = await assyst.parseNew(tag.content, ctx.message, tagArgs, tag);
    if (!result || !result.result) {
      return ctx.editOrReply('Tag returned an empty response');
    }
    return ctx.editOrReply({ content: Markup.escape.mentions(result.result.slice(0, 1990)), allowedMentions: { parse: [] } });
  }
};
