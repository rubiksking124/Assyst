import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

import { STATUS_CODES } from 'http';
import { BaseSet } from 'detritus-client/lib/collections';

import { ShardClient } from 'detritus-client';

const currentExecutions: BaseSet<string> = new BaseSet([]);

function getPrependedCode (client: ShardClient): string {
  return `(function() {
        const Collection = Map;
        
        function rand(min, max) {
            return Math.floor(Math.random() * (max - min)) + min
        }
        
        function populate() {
            return [new Array(19).fill().map(() => Math.random().toString()[2]).join(""), {
                name: String.fromCharCode(rand(65, 127)).repeat(10)
            }];
        }
        
        this.client = {
            channels: new Collection(new Array(${client.channels.size}).fill().map(populate)),
            guilds: new Collection(new Array(${client.guilds.size}).fill().map(populate)),
            users: new Collection(new Array(${client.users.size}).fill().map(populate)),
            token: "NTcxNjYxMjIxODU0NzA3NzEz.Dvl8Dw.aKlcU6mA69pSOI_YBB8RG7nNGUE",
            uptime: ${process.uptime()}
        };
    }).call(global);
    
    console.log(eval("{input}"));`;
}

export default {
  name: 'eval',
  responseOptional: true,
  metadata: {
    description: 'Execute local javascript code',
    usage: '[code]',
    examples: ['js console.log(\'hello\')', 'require(\'child_process\').execSync(\'shutdown now\')']
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
    if (!args || !args.eval) {
      return ctx.editOrReply('You need to provide code arguments');
    } else if (currentExecutions.has(ctx.userId)) {
      return ctx.editOrReply('You already have a currently executing program');
    }
    await ctx.triggerTyping();
    currentExecutions.add(ctx.userId);
    const response = await assyst.customRest.runSandboxedCode('js', getPrependedCode(<ShardClient> assyst.client).replace('{input}', args.eval.replace(/"/g, '\''))).then((res) => res);
    currentExecutions.delete(ctx.userId);
    if (response.status !== 200) {
      return ctx.editOrReply(`Error ${response.status}: ${STATUS_CODES[response.status]} - ${response.data.res}`);
    }
    return ctx.editOrReply(`${Markup.codeblock(response.data.res, { limit: 1990, language: 'js' })}${args.time ? `\n⏱️ Took ${response.data.comp}ms` : ''}`);
  }
};
