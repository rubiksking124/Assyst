import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

import { STATUS_CODES } from 'http';

function getPrependedCode(): string {
  return `
  const fns = [];
  const suite = {
    add(data) {
        fns.push(data);
        return this;
    },
    run(data) {
        for (const test of fns) {
            console.time(test.name);
            for (let i = 0; i < data.iterations; ++i) {
                test.fn(i);
            }
            console.timeEnd(test.name);
        }
    }
  };
  
  function bm(...funcs) {
     let i = 0;
     for (const arg of funcs) {
         if (typeof arg === 'function') {
             suite.add({ name: i, fn: arg })
         } else {
             suite.run({ iterations: parseInt(arg, 10) });
             break;
         }
         i++;
     }
  }\n`;
}

export default {
  name: 'benchmark',
  aliases: ['bench'],
  responseOptional: true,
  metadata: {
    description: 'Benchmark JavaScript code',
    usage: '',
    examples: ['-benchmark suite\n\t.add({ name: \'floor\', fn: (i) => Math.floor(i) })\n\t.add({ name: \'bit\', fn: (i) => i | 0 });']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.benchmark) {
      return ctx.editOrReply('You need to provide code arguments');
    }
    await ctx.triggerTyping();

    const prependedCode = getPrependedCode();
    const response = await assyst.customRest.runSandboxedCode('js', prependedCode + args.benchmark);

    if (typeof response === 'string') {
      return ctx.editOrReply(response.slice(0, 1990));
    }

    if (response.status !== 200) {
      return ctx.editOrReply(`Error ${response.status}: ${STATUS_CODES[response.status]} - ${response.data.res}`);
    }

    return ctx.editOrReply(Markup.codeblock(response.data.res, { limit: 1990, language: 'js' }));
  }
};
