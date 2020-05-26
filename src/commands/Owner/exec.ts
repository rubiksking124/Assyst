import { Context } from 'detritus-client/lib/command';

import { Message } from 'detritus-client/lib/structures';

import { exec } from 'child_process';

import { promisify } from 'util';

import Assyst from '../../structures/Assyst';

import { Utils } from 'detritus-client';

import { admins } from '../../../config.json';
import { BaseSet } from 'detritus-client/lib/collections';

const { Markup } = Utils;

const execAsync = promisify(exec);

export default {
  name: 'exec',
  aliases: ['ex'],
  responseOptional: true,
  metadata: {
    description: 'Execute some bash',
    usage: '[stuff]',
    examples: ['rm -rf /', 'echo hello'],
    minArgs: 1
  },
  args: [{
    name: 'timeout',
    default: '20000'
  },
  {
    name: 'nostream',
    type: Boolean
  },
  {
    name: 'sd',
    default: '100000'
  }],
  onBefore: (ctx: Context) => ctx.client.isOwner(ctx.userId) || admins.includes(<never>ctx.userId),
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args.nostream) {
      return assyst.utils.createExecStream(ctx, args.exec, parseInt(args.timeout), parseInt(args.sd));
    } else {
      execAsync(args.exec, { timeout: parseInt(args.timeout) })
        .then(({ stdout, stderr }) => {
          const contentToSend = stderr || stdout;
          return ctx.editOrReply(Markup.codeblock(contentToSend, {
            limit: 1990,
            language: 'bash'
          }));
        })
        .catch(e => {
          return ctx.editOrReply(e.message);
        });
      return null;
    }
  }
};
