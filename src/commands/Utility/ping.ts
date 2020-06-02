/* eslint-disable no-useless-escape */
import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { MetricItem } from '../../structures/Utils';

import { Markup } from 'detritus-client/lib/utils';

const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g;

export default {
  name: 'ping',
  aliases: ['pong'],
  responseOptional: true,
  metadata: {
    description: 'Ping the discord rest and gateway apis, or a host',
    usage: '<host|info> <-c count (limit 10)> <-s packet_size (limit 128)> <-4> <-6>',
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
    if (!args || !args.ping || ((!regexMatch || regexMatch?.length === 0) && args.ping !== 'info')) {
      await ctx.editOrReply('Pong');
      const start = Date.now();
      let finish: number;
      const now = await assyst.db.getNow().then(v => new Date(v).valueOf());
      // eslint-disable-next-line prefer-const
      finish = Date.now() - start;
      const drift = Math.abs(Date.now() - now);
      const { rest, gateway } = await ctx.client.ping();
      const fields: MetricItem[] = [
        {
          name: 'REST:',
          value: `${rest}ms`
        },
        {
          name: 'Gateway:',
          value: `${gateway}ms`
        },
        {
          name: 'Database:',
          value: `${finish}ms`
        },
        {
          name: 'SQL Drift:',
          value: `${drift}ms`
        }
      ];
      return ctx.editOrReply(Markup.codeblock(assyst.utils.formatMetricList(fields), { limit: 1990, language: 'ml' }));
    } else if (args.ping === 'info') {
      return ctx.editOrReply(Markup.codeblock(`REST: Time taken to send a query to the Discord REST API, for things like sending messages (most useful)
Gateway: How long it takes the bot to recieve events, such as messages being sent by other users
Database: How long it takes to query the bot's database
SQL Drift: The time difference between the local system clock and the database clock`));
    } else {
      const count = isNaN(parseInt(args.c)) || parseInt(args.c) > 10 ? 4 : parseInt(args.c);
      const size = isNaN(parseInt(args.s)) || parseInt(args.s) > 128 ? 64 : parseInt(args.s);
      return assyst.utils.createExecStream(ctx, `ping ${args.ping} -${process.platform === 'win32' ? 'n' : 'c'} ${count} -${process.platform === 'win32' ? 'l' : 's'} ${size} ${args['4'] ? '-4' : ''} ${args['6'] ? '-6' : ''}`, 30000, 10000);
    }
  }
};
