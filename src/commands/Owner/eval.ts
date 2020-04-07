/* eslint-disable no-eval */
import { Context, Command } from 'detritus-client/lib/command';

import { inspect } from 'util';

import Assyst from '../../structures/Assyst';

import { Utils } from 'detritus-client';

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

const { Markup } = Utils;

export default {
  name: 'eval',
  aliases: ['e'],
  responseOptional: true,
  metadata: {
    description: 'Evaluate some code',
    usage: '[code]',
    examples: ['1', 'process.reallyExit()'],
    minArgs: 1
  },
  args: [
    {
      name: 'async',
      type: Boolean
    }
  ],
  onBefore: (ctx: Context): boolean => ctx.client.isOwner(ctx.userId),
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    let evaled: any;
    try {
      if (!args.async) {
        evaled = await Promise.resolve(eval(args.eval));
      } else {
        evaled = await Promise.resolve(eval(`(async () => { ${args.eval} })()`));
      }
    } catch (e) {
      return ctx.editOrReply(Markup.codeblock(e.message, { limit: 1990, language: 'js' }));
    }

    if (typeof evaled === 'object') {
      evaled = inspect(evaled, { depth: 0, showHidden: true });
    } else {
      evaled = String(evaled);
    }

    evaled = evaled.split(ctx.client.token).join(' ');

    return ctx.editOrReply(Markup.codeblock(evaled, { language: 'js', limit: 1990 }));
  }
};
