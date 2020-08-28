/* eslint-disable no-eval */
import { Command } from 'detritus-client';
import { Markup } from 'detritus-client/lib/utils';
import { inspect } from 'util';

import { BaseAdminCommand } from '../baseadmincommand';

import { tokens } from '../../../config.json';

const tokensList = Object.values(tokens).join('|');

// eslint-disable-next-line no-useless-escape
const TOKEN_REGEX: RegExp = new RegExp(tokensList.replace(/([\.\{\}\(\)\*\+\-\=\!\?\^\$])/g, '\\$1'), 'g');

export interface CommandArgs {
    code: string,
    noreply: boolean,
    depth: number,
    attach: boolean,
    async: boolean
}

export default class EvalCommand extends BaseAdminCommand {
    aliases = ['e']

    args = [
      {
        name: 'async',
        type: Boolean,
        default: false
      },
      {
        name: 'attach',
        type: Boolean,
        default: false
      },
      {
        name: 'depth',
        default: '0',
        type: Number
      },
      {
        name: 'noreply',
        type: Boolean,
        default: false
      }
    ]

    label = 'code'

    name = 'eval'

    metadata = {
      description: 'Evaluate JavaScript',
      examples: ['1+1'],
      usage: '[code]'
    }

    async run (context: Command.Context, args: CommandArgs) {
      let evaled: any;
      try {
        if (!args.async) {
          evaled = await Promise.resolve(eval(args.code));
        } else {
          evaled = await Promise.resolve(eval(`(async () => { ${args.code} })()`));
        }
      } catch (e) {
        return context.editOrReply(Markup.codeblock(e.message, { limit: 1990, language: 'js' }));
      }

      if (args.attach && !args.noreply) {
        let extension = 'txt';

        if (Buffer.isBuffer(evaled)) extension = 'png';
        else if (typeof evaled === 'object') {
          evaled = inspect(evaled, { depth: args.depth, showHidden: true });
        } else {
          evaled = String(evaled);
        }

        if (typeof evaled === 'string') evaled = evaled.replace(TOKEN_REGEX, '');
        return context.editOrReply({ file: { value: evaled, filename: `eval.${extension}` } });
      } else if (!args.noreply) {
        if (typeof evaled === 'object') {
          evaled = inspect(evaled, { depth: args.depth, showHidden: true });
        } else {
          evaled = String(evaled);
        }

        evaled = evaled.replace(TOKEN_REGEX, '');

        return context.editOrReply(Markup.codeblock(evaled, { language: 'js', limit: 1990 }));
      }
    }
}
