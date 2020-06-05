import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';
import { inspect } from 'util';

import { fakeEvalChannel } from '../../../config.json';

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

    await ctx.triggerTyping();

    let response;
    try {
      response = await assyst.ivmContext.eval(args.eval, {
        timeout: 50,
        copy: true,
        promise: true
      }).then(v => v.result);
    } catch (e) {
      response = e.message;
    }

    if (typeof response !== 'string') response = inspect(response, { depth: 1 });

    response = response.replace(/ could not be cloned\./g, '');

    const c = await ctx.rest.fetchChannel(fakeEvalChannel);
    c.createMessage(`Guild: \`${ctx.guildId}\`\nChannel: \`${ctx.channelId}\`\nUser: \`${ctx.userId} (${ctx.user.name})\`\n\nCommand: \`${Markup.escape.all(ctx.content)}\`\nResponse: ${Markup.codeblock(response, { language: 'js', limit: 1900 })}`);

    return ctx.editOrReply({
      content: Markup.codeblock(response, {
        language: 'js',
        limit: 1990
      }),
      allowedMentions: { parse: [] }
    });
  }
};
