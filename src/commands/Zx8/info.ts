import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { MetricItem } from '../../structures/Utils';
import Zx8RestClient from '../../rest/clients/Zx8';
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
    const client: Zx8RestClient | undefined = <Zx8RestClient | undefined>assyst.customRest.clients.get('zx8');
    if (!client) throw new Error('There is no zx8 client present in the rest controller');
    const res = await client.getInfo();
    const rows: MetricItem[] = [];
    Object.entries(res).forEach(([key, value]) => {
      key = key[0].toUpperCase() + key.slice(1);
      rows.push({
        name: `${key}:`,
        value
      });
    });
    return ctx.editOrReply({
      embed: {
        title: 'zx8 Information',
        description: Markup.codeblock(assyst.utils.formatMetricList(rows, 20, [{
          item: 'TableSize:',
          format: (item: number) => { return `${item.toString()} MB`; }
        },
        {
          item: 'Rss:',
          format: (item: number) => { return `${item.toString()} MB`; }
        },
        {
          item: 'QueryCache:',
          format: (item: number) => { return `${item.toString()} entries`; }
        },
        {
          item: 'ContentTypes:',
          format: (item: any) => {
            return `
 -- Images: ${item.image}
 -- Animated: ${item.animated}
 -- Videos: ${item.video}
 -- HTML: ${item.html}
 -- Other: ${item.other}`;
          }
        }]), { language: 'ml' }),
        color: 0x0fbcf9
      }
    });
  }
};
