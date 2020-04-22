import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { MetricItem } from '../../structures/Utils';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'guildinfo',
  aliases: ['serverinfo'],
  responseOptional: true,
  metadata: {
    description: 'Get server information',
    usage: '',
    examples: ['']
  },
  ratelimit: {
    type: '',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    let guild = ctx.guild;
    if (!guild) {
      try {
        guild = await ctx.rest.fetchGuild(<string> ctx.guildId);
      } catch (e) {
        return ctx.editOrReply(e.message);
      }
    }
    const memberCount = guild.memberCount;
    const roleCount = guild.roles.size;
    const ownerId = guild.ownerId;
    const creationDate = guild.createdAt.toLocaleString();
    const daysElapsedSinceCreate = Math.round((Date.now() - guild.createdAtUnix) / 1000 / 60 / 60 / 24);
    const maxMembers = guild.maxMembers;
    const region = guild.region;
    const features = guild.features;
    const premiumTier = guild.premiumTier;
    const description = guild.description;
    const vanityCode = guild.vanityUrlCode;
    const fields: MetricItem[] = [
      {
        name: 'Members:',
        value: memberCount.toString()
      },
      {
        name: 'Roles:',
        value: roleCount.toString()
      },
      {
        name: 'Owner:',
        value: ownerId
      },
      {
        name: 'Created:',
        value: `${creationDate} (${daysElapsedSinceCreate} days ago)`
      },
      {
        name: 'MaximumMembers:',
        value: maxMembers.toString()
      },
      {
        name: 'Region:',
        value: region
      },
      {
        name: 'Features:',
        value: ((): string => {
          if (features.length === 0) return 'None';
          let returnString = '';
          returnString = <string> features.first();
          for (let i = 1; i < features.length; i++) {
            returnString = `${returnString}\n          ------ ${Array.from(features)[i]}`;
          }
          return returnString;
        })()
      },
      {
        name: 'PremiumTier:',
        value: premiumTier.toString()
      },
      {
        name: 'Description:',
        value: description || 'none'
      },
      {
        name: 'Vanity:',
        value: vanityCode || 'none'
      }
    ];
    const result = assyst.utils.formatMetricList(fields);
    return ctx.editOrReply(Markup.codeblock(result, {
      language: 'ml',
      limit: 1990
    }));
  }
};
