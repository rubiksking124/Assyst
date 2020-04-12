import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

import { STATUS_CODES } from 'http';
import GocodeitRestClient from '../../rest/clients/Gocodeit';
import { BaseSet } from 'detritus-client/lib/collections';

const currentExecutions: BaseSet<string> = new BaseSet([]);

export default {
  name: 'code',
  aliases: ['run'],
  responseOptional: true,
  metadata: {
    description: 'Run code in a range of languages (use `list` subcommand for a list)',
    usage: '[language] [code]',
    examples: ['sh echo 1', 'js console.log(\'hello\')']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  args: [
    {
      name: 'time',
      type: Boolean
    }
  ],
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const client: GocodeitRestClient | undefined = <GocodeitRestClient | undefined>assyst.customRest.clients.get('gocodeit');
    if (!client) throw new Error('No gocodeit client is defined');
    if (!args || !args.code) {
      return ctx.editOrReply('You need to provide language and code arguments');
    } else if (args.code === 'list') {
      const languages = await client.getLanguageList().then((res) => res.data);
      return ctx.editOrReply(`Supported languages: ${languages.map(l => `\`${l}\``).join(', ')}`);
    } else if (args.code.split(' ').length === 1) {
      return ctx.editOrReply('You need to provide a code argument');
    } else if (currentExecutions.has(ctx.userId)) {
      return ctx.editOrReply('You already have a currently executing program');
    }
    await ctx.triggerTyping();
    currentExecutions.add(ctx.userId);
    const response = await client.runSandboxedCode(args.code.split(' ')[0], args.code.split(' ').slice(1).join(' ')).then((res) => res);
    currentExecutions.delete(ctx.userId);
    if (response.status !== 200) {
      return ctx.editOrReply(`Error ${response.status}: ${STATUS_CODES[response.status]} - ${response.data.res}`);
    }
    return ctx.editOrReply(`${Markup.codeblock(response.data.res, { limit: 1990, language: args.code.split(' ')[0] })}${args.time ? `\n⏱️ Took ${response.data.comp}ms` : ''}`);
  }
};
