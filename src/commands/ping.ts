import { Context } from 'detritus-client/lib/command';

import Assyst from '../structures/Assyst';

export default {
  name: 'ping',
  aliases: ['pong'],
  responseOptional: true,
  metadata: {
    description: 'Ping the discord rest and gateway apis',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 3000
  },
  run: async (assyst: Assyst, ctx: Context) => {
    await ctx.editOrReply('Pong');
    const start = Date.now();
    let finish: number;
    await assyst.sql('select now()');
    // eslint-disable-next-line prefer-const
    finish = Date.now() - start;
    const { rest, gateway } = await ctx.client.ping();
    ctx.editOrReply(`Pong (REST: ${rest}ms) (Gateway: ${gateway}ms) (Database: ${finish}ms)`);
  }
};
