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
    const elapsedProcessTime = assyst.utils.elapsed(uptime);
    const elapsedWebsocketTime = assyst.utils.elapsed(Date.now() - assyst.startedAt.getTime());
    const lastStartedProcessString = `${elapsedProcessTime.days > 0 ? `${elapsedProcessTime.days} days, ` : ''}${elapsedProcessTime.hours > 0 ? `${elapsedProcessTime.hours} hours, ` : ''}${elapsedProcessTime.minutes > 0 ? `${elapsedProcessTime.minutes} minutes, ` : ''}${elapsedProcessTime.seconds} seconds`;
    const lastStartedWebsocketString = `${elapsedWebsocketTime.days > 0 ? `${elapsedWebsocketTime.days} days, ` : ''}${elapsedWebsocketTime.hours > 0 ? `${elapsedWebsocketTime.hours} hours, ` : ''}${elapsedWebsocketTime.minutes > 0 ? `${elapsedWebsocketTime.minutes} minutes, ` : ''}${elapsedWebsocketTime.seconds} seconds`;
    ctx.editOrReply(`Process uptime: ${lastStartedProcessString}\nWebsocket uptime: ${lastStartedWebsocketString}\nLast reconnection: ${assyst.startedAt.toLocaleString()}`);
  }
};
