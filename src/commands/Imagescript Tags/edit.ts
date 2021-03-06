import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'imagescripttag edit',
  aliases: ['ist edit'],
  responseOptional: true,
  priority: 2,
  metadata: {
    description: 'Edit an ImageScript tag',
    usage: '[tag name] [tag content]',
    examples: ['test', 'const image = Image.new(1024, 1024)']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args['imagescripttag edit']) {
      return ctx.editOrReply('You need to supply a tag name to edit');
    }
    const [name, ...content] = args['imagescripttag edit'].split(' ');
    if (!content) {
      return ctx.editOrReply('You need to supply tag content');
    }
    const tags = await assyst.db.fetchImageScriptTag(name);
    const tag = tags[0];
    if (!tag || tag.owner !== ctx.userId) {
      return ctx.editOrReply('This tag doesn\'t exist or you don\'t own it');
    }
    await assyst.db.editImageScriptTag(name, assyst.utils.parseCodeblocks(content.join(' '), 'js'));
    return ctx.editOrReply('Tag edited successfully');
  }
};
