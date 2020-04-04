import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { MetricItem } from '../../structures/Utils';
import Zx8RestClient from '../../rest/clients/Zx8';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'zx8 nodes',
  aliases: ['zx8 n'],
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
    const res = await client.getNodes();
    const rows: MetricItem[] = [];

    let embedTitle;

    if (!args || !args['zx8 nodes']) {
      embedTitle = 'zx8 Nodes Availablility';
      res.forEach(node => {
        Object.entries(node).forEach(([key, value]) => {
          key = key[0].toUpperCase() + key.slice(1);
          if (key === 'Available') {
            rows.push({
              name: `${res.indexOf(node).toString()}:`,
              value
            });
          }
        });
      });
    } else {
      if (!isNaN(parseInt(args['zx8 nodes'])) && parseInt(args['zx8 nodes']) >= 0 && parseInt(args['zx8 nodes']) <= res.length) {
        embedTitle = `zx8 Node: ${args['zx8 nodes']}`;
        res.forEach(node => {
          Object.entries(node).forEach(([key, value]) => {
            key = key[0].toUpperCase() + key.slice(1);
            if (node.id.toString() === args['zx8 nodes']) {
              rows.push({
                name: `${key}:`,
                value
              });
            }
          });
        });
      } else {
        return ctx.editOrReply(`Give a valid id between 0 and ${res.length - 1}`);
      }
    }

    return ctx.editOrReply({
      embed: {
        title: embedTitle,
        description: Markup.codeblock(assyst.utils.formatMetricList(rows, 20), { language: 'ml' }),
        color: 0x0fbcf9
      }
    });
  }
};
