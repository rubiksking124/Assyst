import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'session',
  aliases: ['sessions'],
  responseOptional: true,
  metadata: {
    description: 'Get info about the bot\'s gateway connection and session limits',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const session = await ctx.rest.fetchGatewayBot();
    const sessionLimit = session.session_start_limit;
    const ping = await ctx.client.gateway.ping(10000);
    const reset = assyst.utils.elapsed(sessionLimit.reset_after);
    const resetFormat = `${reset.days > 0 ? `${reset.days} days, ` : ''}${reset.hours > 0 ? `${reset.hours} hours, ` : ''}${reset.minutes > 0 ? `${reset.minutes} minutes, ` : ''}${reset.seconds} seconds`;
    return ctx.editOrReply(`Websocket ping: ${ping}ms\nShards: ${session.shards}\nUrl: ${session.url}\n\nIDENTIFY:\nTotal: ${sessionLimit.total}\nRemaining: ${sessionLimit.remaining}\nReset: ${resetFormat}\nMax concurrency: ${sessionLimit.max_concurrency}`);
  }
};
