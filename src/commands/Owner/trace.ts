import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

import { admins } from '../../../config.json';
import { Markup } from 'detritus-client/lib/utils';
import { inspect } from 'util';

export default {
  name: 'trace',
  responseOptional: true,
  metadata: {
    description: '',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: '',
    limit: 1,
    duration: 5000
  },
  onBefore: (assyst: Assyst, ctx: Context) => ctx.client.isOwner(ctx.userId) || admins.includes(<never>ctx.userId),
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const trace = assyst.traceHandler.getTrace(args.trace);
    if (!trace) {
      return ctx.editOrReply('No trace found');
    }
    return ctx.editOrReply({
      embed: {
        title: `${trace.type}: ${trace.message}`,
        description: Markup.codeblock(trace.stack || 'No Stack', { limit: 1990 }),
        timestamp: trace.thrownAt.toISOString(),
        footer: {
          text: 'Thrown At'
        },
        fields: [
          {
            name: 'Args',
            value: ((): string => {
              if (!trace.args || trace.args === {}) return 'None';
              const out: string[] = [];
              Object.keys(trace.args).forEach((arg) => {
                out.push(`${arg}: ${trace.args[arg]}`);
              });
              return out.join('\n');
            })(),
            inline: true
          },
          {
            name: 'Command',
            value: trace.context?.command?.name || 'None',
            inline: true
          },
          {
            name: 'Raw content',
            value: trace.context?.content || 'None',
            inline: true
          },
          {
            name: 'Errors',
            value: trace.error.errors ? Markup.codeblock(inspect(trace.error.errors, { depth: 10 }), { language: 'js' }) : 'None'
          }
        ]
      }
    });
  }
};
