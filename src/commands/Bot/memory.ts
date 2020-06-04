import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'memory',
  aliases: ['memoryusage'],
  responseOptional: true,
  metadata: {
    description: 'Fetch the amount of memory the bot process is using',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const { rss, heapTotal, heapUsed, external, arrayBuffers } = process.memoryUsage();
    let [rssMb, heapTotalMb, heapUsedMb, externalMb, arrayBuffersMb] = [rss / 1000 / 1000, heapTotal / 1000 / 1000, heapUsed / 1000 / 1000, external / 1000 / 1000, arrayBuffers / 1000 / 1000];
    if (isNaN(arrayBuffersMb)) arrayBuffersMb = 0; // Backwards compability
    return ctx.editOrReply(`Rss: ${rssMb.toFixed(2)}MB\nHeap:\n   Used: ${heapUsedMb.toFixed(2)}MB\n   Total: ${heapTotalMb.toFixed(2)}MB\nExternal: ${externalMb.toFixed(2)}MB\nArray Buffers: ${arrayBuffersMb.toFixed(2)}MB`);
  }
};
