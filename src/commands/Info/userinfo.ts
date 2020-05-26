import { Context } from 'detritus-client/lib/command';

import { UserFlags } from 'detritus-client/lib/constants';

import Assyst from '../../structures/Assyst';
import { Member, User } from 'detritus-client/lib/structures';

export default {
  name: 'userinfo',
  aliases: ['uinfo'],
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
    let member: Member | User | undefined;
    if (args && args.userinfo) {
      try {
        member = await ctx.rest.fetchGuildMember(<string> ctx.guildId, args.userinfo);
      } catch (e) {
        let notFound = false;
        if (e.response.statusCode === 400) {
          return ctx.editOrReply('User parameter must be a valid id');
        } else if (e.response.statusCode === 404 && e.message.includes('Unknown Member')) {
          member = await ctx.rest.fetchUser(args.userinfo).catch(() => { notFound = true; return undefined; });
        }
        if (!member || notFound) return ctx.editOrReply(e.message);
      }
    } else {
      if (!ctx.member) {
        member = await ctx.rest.fetchGuildMember(<string> ctx.guildId, ctx.userId);
      } else {
        member = ctx.member;
      }
    }

    const user = member instanceof User ? member : member.user;

    const memberFlags: Array<string> = [];
    for (let i = 0; i < 18; i++) {
      const flagName: string | undefined = UserFlags[1 << i];
      if (flagName) {
        const state = (user.publicFlags & 1 << i) !== 0;
        if (state) memberFlags.push(flagName);
      }
    }

    const memberColor = member instanceof Member ? member.color : 0xb9bbbe;
    const joinDate = member instanceof Member ? new Date(member.joinedAtUnix).toLocaleString() : 'None';
    const daysElapsedSinceJoin = member instanceof Member ? `(${Math.round((Date.now() - member.joinedAtUnix) / 1000 / 60 / 60 / 24)} days ago)` : '';
    const createdDate = new Date(user.createdAtUnix).toLocaleString();
    const daysElapsedSinceCreate = Math.round((Date.now() - user.createdAtUnix) / 1000 / 60 / 60 / 24);
    const roleCount = member instanceof Member ? member.roles.length : 0;

    return ctx.editOrReply({
      embed: {
        description: user.mention,
        color: memberColor,
        author: {
          name: `${user.name}#${user.discriminator}`,
          iconUrl: user.avatarUrl
        },
        fields: [
          {
            name: 'Join Date',
            value: `${joinDate} ${daysElapsedSinceJoin}`,
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
            value: memberFlags.length > 0 ? memberFlags.join('\n') : 'None',
            inline: true
          }
        ]
      }
    });
  }
};
