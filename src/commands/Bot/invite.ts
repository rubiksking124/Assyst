import { Context, ArgumentParser } from 'detritus-client/lib/command';

import { ShardClient } from 'detritus-client';

import Assyst from '../../structures/Assyst';
import { MetricItem } from '../../structures/Utils';
import { Markup } from 'detritus-client/lib/utils';
import { Invite } from 'detritus-client-rest/lib/endpoints';

export default {
  name: 'invite',
  responseOptional: true,
  metadata: {
    description: 'Fetch the Assyst or a server invite',
    usage: '<code>',
    examples: ['gVZ35NG', '']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 3000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.invite) {
      return ctx.editOrReply(`Bot invite: <${(<ShardClient> assyst.client).application?.oauth2UrlFormat({ scope: 'bot' })}>\nJoin the support server: <https://jacher.io/assyst>\nVote for Assyst: <https://top.gg/bot/${ctx.client.user?.id}/vote>`);
    }
    const code = args.invite;
    let invite = Invite;
    try {
      invite = await ctx.rest.fetchInvite(code, { withCounts: true });
    } catch (e) {
      return ctx.editOrReply(e.message);
    }
    const fields: MetricItem[] = [
      {
        name: 'Channel:',
        value: invite.channel ? `${invite.channel.name} (${invite.channel.id})` : 'Unknown'
      },
      {
        name: 'Members:',
        value: invite.approximateMemberCount?.toString() || 'Unknown'
      },
      {
        name: 'Presences:',
        value: invite.approximatePresenceCount?.toString() || 'Unknown'
      },
      {
        name: 'Guild:',
        value: invite.guild ? `${invite.guild.name} (${invite.guild.id})` : 'Unknown'
      },
      {
        name: 'Inviter:',
        value: invite.inviter ? `${invite.inviter.username}#${invite.inviter.discriminator} (${invite.inviter.id})` : 'Unknown'
      },
      {
        name: 'Uses:',
        value: invite.uses?.toString() || 'Unknown'
      },
      {
        name: 'Revoked:',
        value: invite.revoked?.toString() || 'Unknown'
      }
    ];
    ctx.editOrReply({
      embed: {
        title: `Invite: ${args.invite}`,
        color: 0xe39117,
        description: Markup.codeblock(assyst.utils.formatMetricList(fields), { language: 'ml', limit: 1990 })
      }
    });
  }
};
