import { Context } from 'detritus-client/lib/command';
import { Markup } from 'detritus-client/lib/utils'
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
    if (!args['imagescripttag owner']) {
      return ctx.editOrReply('You need to supply a tag name');
    }
    const tags = await assyst.db.fetchImageScriptTag(args['imagescripttag owner']);
    if (tags.length === 0) {
      return ctx.editOrReply('This tag does not exist');
    }
    const tag = tags[0];
    return ctx.editOrReply({ content: `Tag: \`${Markup.escape.all(tag.name)}\` - owner: <@${tag.owner}>`, allowedMentions: { parse: [] }});
  }
};
