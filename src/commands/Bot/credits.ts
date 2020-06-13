import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

import credits from '../../constants/credits';
import { EmbedField } from 'detritus-client/lib/utils';
import { ShardClient } from 'detritus-client';

export default {
  name: 'credits',
  responseOptional: true,
  metadata: {
    description: 'Get credits for people that helped build Assyst',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const fields: EmbedField[] = [];
    credits.forEach(credit => {
      fields.push(new EmbedField({
        name: `${credit.username}${credit.id ? ` (${credit.id})` : ''}`,
        value: credit.contributions.join('\n'),
        inline: false
      }));
    });

    return ctx.editOrReply({
      embed: {
        title: 'Assyst credits',
        fields,
        thumbnail: {
          url: (<ShardClient> assyst.client).user?.avatarUrl
        },
        color: 0xf4632e
      }
    });
  }
};
