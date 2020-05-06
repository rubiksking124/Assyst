/* eslint-disable no-useless-escape */
import { Context, ArgumentParser } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g;

export default {
  name: 'ping',
  aliases: ['pong'],
  responseOptional: true,
  metadata: {
    description: 'Ping the discord rest and gateway apis, or a host',
    usage: '<host> <-c count (limit 10)> <-s packet_size (limit 128)> <-4> <-6>',
    examples: [''],
    minArgs: 0
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 10000
  },
  args: [
    {
      name: 'c',
      default: '4'
    },
    {
      name: 's',
      default: '64'
    },
    {
      name: '4',
      type: Boolean
    },
    {
      name: '6',
      type: Boolean
    }
  ],
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const regexMatch = args.ping ? args.ping.match(urlRegex) : false;
    if (!args || !args.ping || !regexMatch || regexMatch?.length === 0) {
      await ctx.editOrReply('Pong');
      const start = Date.now();
      let finish: number;
      await assyst.db.getNow();
      // eslint-disable-next-line prefer-const
      finish = Date.now() - start;
      const { rest, gateway } = await ctx.client.ping();
      return ctx.editOrReply(`Pong (REST: ${rest}ms) (Gateway: ${gateway}ms) (Database: ${finish}ms)`);
    } else {
      const count = isNaN(parseInt(args.c)) || parseInt(args.c) > 10 ? 4 : parseInt(args.c);
      const size = isNaN(parseInt(args.s)) || parseInt(args.s) > 128 ? 64 : parseInt(args.s);
      return assyst.utils.createExecStream(ctx, `ping ${args.ping} -${process.platform === 'win32' ? 'n' : 'c'} ${count} -${process.platform === 'win32' ? 'l' : 's'} ${size} ${args['4'] ? '-4' : ''} ${args['6'] ? '-6' : ''}`, 30000, 10000);
    }
  }
};
