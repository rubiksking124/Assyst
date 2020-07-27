import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';
import { inspect } from 'util';

import { logs } from '../../../config.json';

export default {
  name: 'eval',
  responseOptional: true,
  metadata: {
    description: 'Execute local javascript code',
    usage: '[code]',
    examples: ['client.token']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  args: [],
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.eval) {
      return ctx.editOrReply('You need to provide code arguments');
    }

    if (!assyst.ivmIsolate || assyst.ivmIsolate.isDisposed) await assyst.buildIsolate();
    if (!assyst.ivmContext || !assyst.ivmIsolate) return ctx.editOrReply('An unknown issue occurred');

    let response;
    try {
      response = await assyst.ivmContext.evalClosure(`
          return (async (str) => {
            const $0 = null;
            let res;

            try {
              res = await eval(str);
            } catch(e) {
              const descriptor = Object.getOwnPropertyDescriptor(e, 'message');
              if (typeof descriptor.get === 'function') {
                res = 'Aborting due to Error#message being a getter';
              } else {
                 res = e.message;
              }
            }

            if (typeof res === 'function') {
              res = res.toString();
            }
            
            return res;
        })($0);`, [args.eval], {
        timeout: 50,
        arguments: {
          copy: true
        },
        result: {
          promise: true,
          copy: true
        }
      }).then(v => v.result);
    } catch (e) {
      response = e.message;
    }

    if (typeof response !== 'string') response = inspect(response, { depth: 1 });

    const guild = await ctx.rest.fetchGuild(<string> ctx.guildId);

    const c = await ctx.rest.fetchChannel(logs.fakeEval);
    c.createMessage(`Guild: \`${ctx.guildId} (${guild})\`\nChannel: \`${ctx.channelId}\` (<#${ctx.channelId}>)\nUser: \`${ctx.userId} (${ctx.user.name})\`\n\nCommand: \`${Markup.escape.all(ctx.content)}\`\nResponse: ${Markup.codeblock(response, { language: 'js', limit: 1900 })}`);

    if (response === '\0') {
      return ctx.triggerTyping();
    }

    return ctx.editOrReply({
      content: Markup.codeblock(response, {
        language: 'js',
        limit: 1990
      }),
      allowedMentions: {
        parse: []
      }
    });
  }
};
