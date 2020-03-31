import { Context } from 'detritus-client/lib/command';

import { exec, ExecException } from 'child_process';

import { promisify } from 'util';

import Assyst from '../../structures/Assyst';

import { Utils } from 'detritus-client';

const { Markup } = Utils;

const execAsync = promisify(exec);

export default {
  name: 'exec',
  aliases: ['ex'],
  responseOptional: true,
  metadata: {
    description: 'Execute some bash',
    usage: '[stuff]',
    examples: ['rm -rf /', 'echo hello']
  },
  onBefore: (ctx: Context) => ctx.client.isOwner(ctx.userId),
  run: async (_assyst: Assyst, ctx: Context, args: any) => {
    execAsync(args.exec, { timeout: 100 })
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
};
