/* eslint-disable no-eval */
import { Context } from 'detritus-client/lib/command';

import { inspect } from 'util';

import Assyst from '../../structures/Assyst';

import {
  admins,
  token,
  fapi,
  dbl,
  db,
  discordbotlist,
  yandex,
  gocode,
  github
} from '../../../config.json';

import { Utils } from 'detritus-client';

const { Markup } = Utils;

const tokensList = `${token}|${fapi}|${dbl}|${db.password}|${db.host}|${discordbotlist}|${yandex.join('|')}|${gocode}|${github}`;

// eslint-disable-next-line no-useless-escape
const tokenRegexp: RegExp | null = new RegExp(tokensList.replace(/([\.\{\}\(\)\*\+\-\=\!\?\^\$])/g, '\\$1'), 'g');

export default {
  name: 'e',
  aliases: ['ev'],
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
    },
    {
      name: 'attach',
      type: Boolean
    },
    {
      name: 'depth',
      default: '0'
    },
    {
      name: 'noreply',
      type: Boolean
    }
  ],
  onBefore: (assyst: Assyst, ctx: Context): boolean => ctx.client.isOwner(ctx.userId) || admins.includes(ctx.userId),
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    let evaled: any;
    let depth = 0;
    if (args.depth !== '0') {
      const parsedDepth = parseInt(args.depth);
      if (!isNaN(parsedDepth)) depth = parsedDepth;
    }
    try {
      if (!args.async) {
        evaled = await Promise.resolve(eval(args.e));
      } else {
        evaled = await Promise.resolve(eval(`(async () => { ${args.eval} })()`));
      }
    } catch (e) {
      return ctx.editOrReply(Markup.codeblock(e.message, { limit: 1990, language: 'js' }));
    }

    if (args.attach && !args.noreply) {
      let extension = 'txt';

      if (Buffer.isBuffer(evaled)) extension = 'png';
      else if (typeof evaled === 'object') {
        evaled = inspect(evaled, { depth, showHidden: true });
      } else {
        evaled = String(evaled);
      }

      if (typeof evaled === 'string') evaled = evaled.replace(tokenRegexp, '');
      return ctx.editOrReply({ file: { data: evaled, filename: `eval.${extension}` } });
    } else if (!args.noreply) {
      if (typeof evaled === 'object') {
        evaled = inspect(evaled, { depth, showHidden: true });
      } else {
        evaled = String(evaled);
      }

      evaled = evaled.replace(tokenRegexp, '');

      return ctx.editOrReply(Markup.codeblock(evaled, { language: 'js', limit: 1990 }));
    }
  }
};
