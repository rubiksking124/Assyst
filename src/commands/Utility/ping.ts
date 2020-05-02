/* eslint-disable no-useless-escape */
import { Context, ArgumentParser } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g;

export default {
  name: 'ping',
  aliases: ['pong'],
  responseOptional: true,
  metadata: {
    description: 'Ping the discord rest and gateway apis',
    usage: '',
    examples: [''],
    minArgs: 0
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 10000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.ping || (args.ping).match(urlRegex).length === 0) {
      await ctx.editOrReply('Pong');
      const start = Date.now();
      let finish: number;
      await assyst.db.getNow();
      // eslint-disable-next-line prefer-const
      finish = Date.now() - start;
      const { rest, gateway } = await ctx.client.ping();
      return ctx.editOrReply(`Pong (REST: ${rest}ms) (Gateway: ${gateway}ms) (Database: ${finish}ms)`);
    } else {
      return assyst.utils.createExecStream(ctx, `ping ${args.ping} -${process.platform === 'win32' ? 'n' : 'c'} 4`, 30000);
    }
  }
};
