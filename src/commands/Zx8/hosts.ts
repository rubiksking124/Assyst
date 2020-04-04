import { Context } from 'detritus-client/lib/command';
import Zx8RestClient from '../../rest/clients/Zx8';
import Assyst from '../../structures/Assyst';
import { MetricItem } from '../../structures/Utils';

import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'zx8 hosts',
  aliases: ['zx8 hs'],
  responseOptional: true,
  metadata: {
    description: 'Search for hosts using the zx8 search engine',
    usage: '<search param>',
    examples: ['hello', 'bruh']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const client: Zx8RestClient | undefined = <Zx8RestClient | undefined>assyst.customRest.clients.get('zx8');
    if (!client) throw new Error('There is no zx8 client present in the rest controller');
    if (!args || !args['zx8 hosts']) {
      return ctx.editOrReply('You need to supply a search parameter');
    }
    const res = await client.searchHosts(args['zx8 hosts'], 10);
    if (res.length === 0) {
      return ctx.editOrReply('No hosts found for this query');
    }
    const rows: MetricItem[] = [];
    res.forEach((host, i) => {
      rows.push({
        name: `${i + 1}:`,
        value: host.url
      });
    });
    return ctx.editOrReply({
      embed: {
        title: 'zx8 Hosts',
        description: assyst.utils.formatMetricList(rows, 5),
        color: 0x0fbcf9
      }
    });
  }
};
