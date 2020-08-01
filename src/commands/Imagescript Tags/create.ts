import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'imagescripttag create',
  aliases: ['ist create'],
  responseOptional: true,
  priority: 2,
  metadata: {
    description: 'Create an ImageScript tag',
    usage: '[tag name] [tag content]',
    examples: ['test', 'const image = Image.new(1024, 1024)']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args['imagescripttag create']) {
      return ctx.editOrReply('You need to supply a tag name and content');
    }
    const [name, ...content]: [string, string] = args['imagescripttag create'].split(' ');
    const tags = await assyst.db.fetchImageScriptTag(name).then(res => res.map(r => r.content));
    if (tags.length > 0) {
      return ctx.editOrReply('This tag already exists');
    }
    if (!content) {
      return ctx.editOrReply('You need to supply tag content');
    }
    await assyst.db.createImageScriptTag(name.split('\n').join('').toLowerCase(), assyst.utils.parseCodeblocks(content.join(' '), 'js'), ctx.userId);
    return ctx.editOrReply('Tag created successfully');
  }
};
