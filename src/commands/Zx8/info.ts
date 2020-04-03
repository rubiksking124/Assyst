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
        name: `${key}:`, // FIX NEEDED: Handle ContentTypes properly here
        value
      });
    });
    return ctx.editOrReply({
      embed: {
        title: 'zx8 Information',
        description: Markup.codeblock(assyst.utils.formatMetricList(rows, 20), { language: 'ml' }),
        color: 0x0fbcf9
      }
    });
  }
};
