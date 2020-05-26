import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { MetricItem } from '../../structures/Utils';
import { Markup } from 'detritus-client/lib/utils';

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
    const totalEvents = events.map(e => parseInt(e.amount)).reduce((a, b) => a + b);
    events.sort((a, b) => parseInt(b.amount) - parseInt(a.amount)).forEach(event => {
      fields.push({
        name: event.name,
        value: event.amount.toString()
      });
    });
    return ctx.editOrReply({
      embed: {
        title: `Event metrics since 18/05/20 (Total ${totalEvents})`,
        description: Markup.codeblock(assyst.utils.formatMetricList(fields), { language: 'ml', limit: 1990 }),
        color: 0xf4632e
      }
    });
  }
};
