import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { ShardClient } from 'detritus-client';

export default {
  name: 'caches',
  responseOptional: true,
  metadata: {
    description: 'Get bot client cache sizes',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const client = <ShardClient> ctx.client;
    const keys = Object.keys(client);
    const out: string[] = [];
    const emptyCaches: string[] = [];
    keys.forEach(key => {
      // @ts-ignore
      const value = client[key];
      if (typeof value === 'object' && 'size' in value) {
        if (value.size === 0) {
          emptyCaches.push(key);
        } else {
          out.push(`${key}: ${value.size}`);
        }
      }
    });
    return ctx.editOrReply(`Caches:\n${out.join('\n')}\n\nEmpty caches: ${emptyCaches.join(', ')}`);
  }
};
