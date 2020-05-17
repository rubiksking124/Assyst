import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { MetricItem } from '../../structures/Utils';

export default {
  name: 'events',
  responseOptional: true,
  metadata: {
    description: 'Get bot event stats',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const events = await assyst.db.getEvents();
    const fields: MetricItem[] = [];
    events.forEach(event => {
      fields.push({
        name: event.name,
        value: event.amount.toString()
      });
    });
    return ctx.editOrReply({
      embed: {}
    });
  }
};
