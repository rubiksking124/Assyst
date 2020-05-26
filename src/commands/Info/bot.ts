import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'bot',
  aliases: ['topgg'],
  responseOptional: true,
  metadata: {
    description: 'Fetch a bot from the top.gg API',
    usage: '[bot id]',
    examples: ['571661221854707713']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 7500
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.bot) {
      return ctx.editOrReply('You need to supply a bot id to search for');
    }
    const response = await assyst.customRest.fetchTopGGBot(args.bot);
    if (response.error) {
      return ctx.editOrReply(response.error);
    };
    const output = assyst.utils.formatMetricList([
      {
        name: 'Username:',
        value: response.username
      },
      {
        name: 'Library:',
        value: response.lib
      },
      {
        name: 'Prefix:',
        value: response.prefix
      },
      {
        name: 'Description:',
        value: response.shortdesc
      },
      {
        name: 'Tags:',
        value: response.tags.length > 0 ? response.tags.join(', ') : 'None'
      },
      {
        name: 'Certified:',
        value: response.certifiedBot
      },
      {
        name: 'Votes:',
        value: response.points
      },
      {
        name: 'Guilds:',
        value: response.server_count
      },
      {
        name: 'Shards:',
        value: response.shard_count
      }
    ]);
    return ctx.editOrReply(Markup.codeblock(output, { language: 'ml', limit: 1990 }));
  }
};
