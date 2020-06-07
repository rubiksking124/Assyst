import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

import { STATUS_CODES } from 'http';

export default {
  name: 'http',
  aliases: ['sc'],
  responseOptional: true,
  metadata: {
    description: 'Return http status code names',
    usage: '[code]',
    examples: ['']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 2000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.http) {
      return ctx.editOrReply('You need to supply a valid http status code');
    }
    const code = args.http;
    if (!Object.prototype.hasOwnProperty.call(STATUS_CODES, code) || isNaN(parseInt(code))) return ctx.editOrReply('Status code is not valid');
    const value = STATUS_CODES[code];
    return ctx.editOrReply(`${args.http}: ${value}`);
  }
};
