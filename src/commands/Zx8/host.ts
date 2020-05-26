import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { MetricItem } from '../../structures/Utils';

import { Markup } from 'detritus-client/lib/utils';

import { Zx8 } from '../../rest/Types';

export default {
  name: 'zx8 host',
  aliases: ['zx8 h'],
  responseOptional: true,
  metadata: {
    description: 'Get a host from the zx8 search engine',
    usage: '<search param>',
    examples: ['hello', 'bruh']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args['zx8 host']) {
      return ctx.editOrReply('You need to supply a search parameter');
    }
    const res = await assyst.customRest.getZx8Host(args['zx8 host']);
    if (res === undefined) {
      return ctx.editOrReply('No host found for this query');
    }
    const rows: MetricItem[] = [];
    Object.entries(res).forEach(([key, value]) => {
      key = key[0].toUpperCase() + key.slice(1);
      if (key !== 'Headers' && key !== 'LastResponseTime') {
        rows.push({
          name: `${key}:`,
          value
        });
      }
    });
    return ctx.editOrReply({
      embed: {
        title: `zx8 Host: ${res.host}`,
        description: Markup.codeblock(assyst.utils.formatMetricList(rows, 20, [
          {
            item: 'LastRequest:',
            format: (item: string) => { return new Date(parseInt(item)).toLocaleString(); }
          },
          {
            item: 'ContentType:',
            format: (item: string) => { return Zx8.ContentType[parseInt(item)]; }
          },
          {
            item: 'Ocr:',
            format: (item: string | null) => {
              if (item) return item.slice(0, 200);
              else return null;
            }
          }
        ]), { language: 'ml' }),
        color: 0x0fbcf9
      }
    });
  }
};
