import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

export default {
  name: 'gituser',
  aliases: ['gu'],
  responseOptional: true,
  metadata: {
    description: 'Fetch a GitHub user or organisation',
    usage: '<user|org>',
    examples: ['AssystDev']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.gituser) {
      return ctx.editOrReply('You need to supply a user or organisation name to search for');
    }
    const query = args.gituser;
    const user = await assyst.customRest.fetchGitHubUser(query);
    return ctx.editOrReply({
      embed: {
        author: {
          iconUrl: 'https://maxcdn.icons8.com/Share/icon/p1em/Logos/github1600.png',
          name: user.login,
          url: user.html_url
        },
        title: `${user.type}: ${user.name}`,
        thumbnail: {
          url: user.avatar_url
        },
        description: user.bio,
        fields: [
          {
            name: 'Created',
            value: user.created_at.toLocaleString(),
            inline: true
          },
          {
            name: 'Repositories',
            value: user.public_repos.toString(),
            inline: true
          },
          {
            name: 'Followers/Following',
            value: `${user.followers.toString()}/${user.following.toString()}`,
            inline: true
          },
          {
            name: 'Email',
            value: user.email || 'None',
            inline: true
          },
          {
            name: 'Company',
            value: user.company || 'None',
            inline: true
          },
          {
            name: 'ID',
            value: user.id.toString(),
            inline: true
          }
        ],
        color: 0xFFFFFE
      }
    });
  }
};
