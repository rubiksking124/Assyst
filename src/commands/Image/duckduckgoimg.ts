import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'duckduckgoimg',
  aliases: ['ddgi', 'img'],
  responseOptional: true,
  metadata: {
    description: 'Search DuckDuckGo Images',
    usage: '<query>',
    examples: ['pizza']
  },
  ratelimit: {
    type: '5000',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!ctx.command) return;
    if (!args || !args.duckduckgoimg) {
      return ctx.editOrReply('You need to supply a search query');
    }
    const results = await assyst.fapi.duckDuckGoImages(args.duckduckgoimg, { safe: true });
    if (results.length === 0) {
      return ctx.editOrReply('No results found');
    }
    const defaultEmbedproperties = {
      title: `Search results: ${args.duckduckgoimg}`,
      author: {
        iconUrl: 'https://frontpageadvantage.com/wp-content/uploads/2019/01/The_DuckDuckGo_Duck.png',
        name: 'DuckDuckGo'
      },
      color: 0xFFFFFE
    };
    const pages: any[] = [];
    results.forEach((result: string, i: number) => {
      pages.push({
        embed: {
          ...defaultEmbedproperties,
          image: {
            url: result
          }
        }
      });
    });
    const paginator = await assyst.paginator.createReactionPaginator({
      message: ctx.message,
      pages
    });
    assyst.replies.set(ctx.messageId, {
      context: ctx,
      reply: paginator.commandMessage,
      command: ctx.command
    });
  }
};
