import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'imagescripttag delete',
  aliases: ['ist delete'],
  responseOptional: true,
  priority: 2,
  metadata: {
    description: 'Delete an ImageScript tag',
    usage: '[tag name]',
    examples: ['test']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args['imagescripttag delete']) {
      return ctx.editOrReply('You need to supply a tag name');
    }
    const tags = await assyst.db.fetchImageScriptTag(args['imagescripttag delete']);
    if (tags.length === 0) {
      return ctx.editOrReply('This tag does not exist');
    }
    const tag = tags[0];
    if (tag.owner !== ctx.userId) {
      return ctx.editOrReply('You don\'t own this tag');
    }
    await assyst.db.deleteImageScriptTag(args['imagescripttag delete']);
    return ctx.editOrReply('Tag deleted successfully');
  }
};
