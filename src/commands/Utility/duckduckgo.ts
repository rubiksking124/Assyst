import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'duckduckgo',
  aliases: ['ddg'],
  responseOptional: true,
  metadata: {
    description: 'Search DuckDuckGo',
    usage: '<query>',
    examples: ['pizza']
  },
  ratelimit: {
    type: '5000',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.duckduckgo) {
      return ctx.editOrReply('You need to supply a search query');
    }
    const results = await assyst.customRest.searchDuckDuckGo(args.duckduckgo).then(r => r.results);
    if (results.length === 0) {
      return ctx.editOrReply('No results found');
    }
    const resultsFormat: string[] = [];
    results.forEach(result => {
      resultsFormat.push(`[${result.title}](${result.link})`);
    });
    return ctx.editOrReply({
      embed: {
        title: `Search results: ${args.duckduckgo}`,
        description: resultsFormat.join('\n'),
        author: {
          iconUrl: 'https://frontpageadvantage.com/wp-content/uploads/2019/01/The_DuckDuckGo_Duck.png',
          name: 'DuckDuckGo'
        },
        color: 0xFFFFFE
      }
    });
  }
};
