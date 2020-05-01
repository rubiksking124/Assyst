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
    let sentData = '';
    const updateQueue: Array<string> = [];
    const stream = exec(args.exec, { timeout: parseInt(args.t) });

    const updateInterval = setInterval(() => {
      const newData = updateQueue.shift();
      if(!newData) return;
      sentData += newData
      ctx.editOrReply(sentData);
    }, 2000);

    setTimeout(() => clearInterval(updateInterval), parseInt(args.t));

    if (stream.stdout === null || stream.stderr === null) {
      console.log(':(');
      return;
    };

    stream.stdout.on('data', async (data) => {
      updateQueue.push(String(data));
    });

    stream.stderr.on('data', async (data) => {
      updateQueue.push(String(data));
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
