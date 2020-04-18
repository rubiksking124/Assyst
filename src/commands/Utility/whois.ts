import { Context } from 'detritus-client/lib/command';

import { UserFlags } from 'detritus-client/lib/constants';

import Assyst from '../../structures/Assyst';
import { Member } from 'detritus-client/lib/structures';

export default {
  name: 'whois',
  aliases: ['userinfo'],
  responseOptional: true,
  metadata: {
    description: 'Get user information about a user',
    usage: '<user id>',
    examples: ['', '233667448887312385']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    let member: Member;
    if (args && args.whois) {
      try {
        member = await ctx.rest.fetchGuildMember(<string> ctx.guildId, args.whois);
      } catch (e) {
        if (e.response.statusCode === 400) {
          return ctx.editOrReply('User parameter must be a valid id');
        }
        return ctx.editOrReply(e.message);
      }
    } else {
      if (!ctx.member) {
        member = await ctx.rest.fetchGuildMember(<string> ctx.guildId, ctx.userId);
      } else {
        member = ctx.member;
      }
    }

    const memberFlags: Array<string> = [];
    for (let i = 0; i < 16; i++) {
      const flagName: string | undefined = UserFlags[1 << i];
      if (flagName) {
        const state = (member.user.publicFlags & 1 << i) !== 0;
        if (state) memberFlags.push(flagName);
      }
    }

    const memberColor = ctx.member?.color;
    const joinDate = new Date(member.joinedAtUnix).toLocaleString();
    const daysElapsedSinceJoin = Math.round((Date.now() - member.joinedAtUnix) / 1000 / 60 / 60 / 24);
    const createdDate = new Date(member.user.createdAtUnix).toLocaleString();
    const daysElapsedSinceCreate = Math.round((Date.now() - member.user.createdAtUnix) / 1000 / 60 / 60 / 24);
    const roleCount = member.roles.length;
    return ctx.editOrReply({
      embed: {
        description: member.user.mention,
        color: memberColor,
        author: {
          name: `${member.user.name}#${member.user.discriminator}`,
          iconUrl: member.user.avatarUrl        
        },
        fields: [
          {
            name: 'Join Date',
            value: `${joinDate} (${daysElapsedSinceJoin} days ago)`,
            inline: false
          },
          {
            name: 'Creation Date',
            value: `${createdDate} (${daysElapsedSinceCreate} days ago)`,
            inline: false
          },
          {
            name: 'Role Count',
            value: roleCount.toString(),
            inline: true
          },
          {
            name: 'User Flags',
            value: memberFlags.length > 0 ? memberFlags.join(', ') : 'None',
            inline: true
          }
        ]
      }
    });
  }
};
