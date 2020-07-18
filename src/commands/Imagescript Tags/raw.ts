import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'imagescripttag raw',
  aliases: ['ist raw'],
  responseOptional: true,
  priority: 2,
  metadata: {
    description: 'Fetch the raw content of an ImageScript Tag',
    usage: '[tag name]',
    examples: ['test']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args['imagescripttag raw']) {
      return ctx.editOrReply('You need to supply a tag name');
    }
    const tags = await assyst.db.fetchImageScriptTag(args['imagescripttag raw']);
    if (tags.length === 0) {
      return ctx.editOrReply('This tag does not exist');
    }
    const tag = tags[0];
    return ctx.editOrReply(`Tag: \`${tag.name}\` - raw content: ${Markup.codeblock(tag.content, { language: 'js', limit: 1990 })}`);
  }
};
