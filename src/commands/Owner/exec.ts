import { Context } from 'detritus-client/lib/command';

import { Message } from 'detritus-client/lib/structures';

import { exec } from 'child_process';

import { promisify } from 'util';

import Assyst from '../../structures/Assyst';

import { Utils } from 'detritus-client';

import { admins } from '../../../config.json';

const { Markup } = Utils;

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
    name: 't',
    default: '20000'
  }],
  onBefore: (ctx: Context) => ctx.client.isOwner(ctx.userId) || admins.includes(<never>ctx.userId),
  run: async (_assyst: Assyst, ctx: Context, args: any) => {
    let cooldown: number = 0;
    let response: Message | undefined;
    let sentResponse: boolean;
    const stream = exec(args.exec);

    if (stream.stdout === null || stream.stderr === null) {
      console.log(':(');
      return;
    };

    stream.stdout.on('data', async (data) => {
      if (!sentResponse && Date.now() > cooldown + 1000) {
        sentResponse = true;
        response = await ctx.reply(Markup.codeblock(String(data), { limit: 1990 }));
        cooldown = Date.now();
      } else if (Date.now() > cooldown + 1000 && sentResponse && response) {
        (<Message>response).edit(Markup.codeblock(String(data), { limit: 1990 }));
      }
    });

    stream.stderr.on('data', async (data) => {
      if (!sentResponse && Date.now() > cooldown + 1000) {
        sentResponse = true;
        response = await ctx.reply(Markup.codeblock(String(data), { limit: 1990 }));
        cooldown = Date.now();
      } else if (Date.now() > cooldown + 1000 && sentResponse && response) {
        (<Message>response).edit(Markup.codeblock(String(data), { limit: 1990 }));
      }
    });

    /* execAsync(args.exec, { timeout: parseInt(args.t) })
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
    return null; */
  }
};
