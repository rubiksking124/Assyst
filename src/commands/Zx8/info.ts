import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { MetricItem } from '../../structures/Utils';

import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'zx8 info',
  aliases: ['zx8 i'],
  responseOptional: true,
  metadata: {
    description: 'Get info about the zx8 search engine web scraper',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const res = await assyst.customRest.getZx8Info();
    const rows: MetricItem[] = [];
    Object.entries(res).forEach(([key, value]) => {
      key = key[0].toUpperCase() + key.slice(1);
      rows.push({
        name: `${key}:`,
        value: typeof value === 'number' ? value.toLocaleString() : value
      });
    });
    return ctx.editOrReply({
      embed: {
        title: 'zx8 Information',
        description: Markup.codeblock(assyst.utils.formatMetricList(rows, 20, [{
          item: 'TableSize:',
          format: (item: string) => { return `${item} MB`; }
        },
        {
          item: 'Rss:',
          format: (item: string) => { return `${item} MB`; }
        },
        {
          item: 'QueryCache:',
          format: (item: string) => { return `${item} entries`; }
        },
        {
          item: 'ContentTypes:',
          format: (item: any) => {
            return `
 -- Images: ${item.image.toLocaleString()}
 -- Animated: ${item.animated.toLocaleString()}
 -- Videos: ${item.video.toLocaleString()}
 -- HTML: ${item.html.toLocaleString()}
 -- Other: ${item.other.toLocaleString()}`;
          }
        }]), { language: 'ml' }),
        color: 0x0fbcf9
      }
    });
  }
};
