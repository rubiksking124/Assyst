import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'uptime',
  aliases: ['up'],
  responseOptional: true,
  metadata: {
    description: 'Get process uptime',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 3000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const uptime = process.uptime() * 1000;
    const elapsedTime = assyst.utils.elapsed(uptime);
    const lastStarted = new Date(Date.now() - Math.round(uptime));
    ctx.editOrReply(`Up for ${elapsedTime.days > 0 ? `${elapsedTime.days} days, ` : ''}${elapsedTime.hours > 0 ? `${elapsedTime.hours} hours, ` : ''}${elapsedTime.minutes > 0 ? `${elapsedTime.minutes} minutes, ` : ''}${elapsedTime.seconds} seconds
Last started: ${lastStarted.toLocaleString()}`);
  }
};
