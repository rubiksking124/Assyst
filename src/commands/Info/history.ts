import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'history',
  aliases: ['onthisday', 'otd'],
  responseOptional: true,
  metadata: {
    description: 'Get a random historical event that took place today',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, _args: any) => {
    ctx.triggerTyping();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const response = await assyst.customRest.getHistory(month.toString(), day.toString()).then(res => res.events);
    const event = response[Math.floor(Math.random() * response.length)];
    return ctx.editOrReply(`**On this day (${day}/${month}/${new Date().getFullYear()}), in the year ${event.year}:**\n${Markup.codeblock(event.description)}`);
  }
};
