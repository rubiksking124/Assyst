import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

import { STATUS_CODES } from 'http';

import { ShardClient } from 'detritus-client';

const currentExecutions: Set<string> = new Set();

async function getPrependedCode (client: ShardClient): Promise<string> {
  const guilds = await client.rest.fetchMeGuilds();
  const guildSize = guilds.size;
  return `(function() {
        class Collection extends Map {
          constructor(options) {
            super(options)
          }
        }
        
        function rand(min, max) {
            return Math.floor(Math.random() * (max - min)) + min
        }
        
        function populate() {
            return [new Array(19).fill().map(() => Math.random().toString()[2]).join(""), {
                name: String.fromCharCode(rand(65, 127)).repeat(rand(5, 32))
            }];
        }
        
        this.client = {
            channels: new Collection(new Array(${Math.floor(guildSize * 20.5)}).fill().map(populate)),
            guilds: new Collection(new Array(${guildSize}).fill().map(populate)),
            users: new Collection(new Array(${Math.floor(guildSize * 325.5)}).fill().map(populate)),
            token: "NTcxNjYxMjIxODU0NzA3NzEz.Dvl8Dw.aKlcU6mA69pSOI_YBB8RG7nNGUE",
            uptime: ${process.uptime()}
        };
    }).call(global);
    
    console.log(eval(\`{input}\`));`;
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

    if (!assyst.ivmIsolate || assyst.ivmIsolate.isDisposed) await assyst.buildIsolate();
    if (!assyst.ivmContext || !assyst.ivmIsolate) return ctx.editOrReply("An unknown issue occurred");

    await ctx.triggerTyping();
    currentExecutions.add(ctx.userId);
    
    let response;
    try {
      response = await assyst.ivmContext.eval(args.eval, {
        timeout: 50,
        promise: true,
        copy: true
      });
    } catch(e) {
      response = e.message;
    }

    return ctx.editOrReply(Markup.codeblock(response, {
      language: 'js',
      limit: 1990
    }));
  }
};
