import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { GitHub } from '../../rest/Types';

export default {
  name: 'repository',
  aliases: ['repo'],
  responseOptional: true,
  metadata: {
    description: 'Fetch a GitHub repository',
    usage: '<repository>',
    examples: ['Assyst']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    ctx.triggerTyping();
    if (!args || !args.repository) {
      return ctx.editOrReply('You need to supply a repository name to search for');
    }
    const query = args.repository;
    const response = await assyst.customRest.searchGitHubRepository(query);
    if(response.items.length === 0) {
        return ctx.editOrReply('No repository found');
    }
    const repository = response.items[0];
    return ctx.editOrReply({
        embed: {
            author: {
                url: repository.html_url,
                iconUrl: 'https://maxcdn.icons8.com/Share/icon/p1em/Logos/github1600.png',
                name: repository.name
            },
            title: `Repository: ${repository.name}`,
            description: repository.description || 'No description provided',
            thumbnail: {
                url: repository.owner.avatar_url
            },
            fields: [
                {
                    name: 'Created',
                    value: new Date(repository.created_at).toLocaleString(),
                    inline: true
                },
                {
                    name: 'Stars',
                    value: repository.stargazers_count.toString(),
                    inline: true
                },
                {
                    name: 'Language',
                    value: repository.language,
                    inline: true
                },
                {
                    name: 'Owner',
                    value: repository.owner.login,
                    inline: true
                },
                {
                    name: 'Updated',
                    value: new Date(repository.updated_at).toLocaleString(),
                    inline: true
                },
                {
                    name: 'Forks',
                    value: repository.forks_count.toString(),
                    inline: true
                },
                {
                    name: 'Watchers',
                    value: repository.watchers_count.toString(),
                    inline: true
                }
            ],
            color: 0xFFFFFE
        }
    })
  }
};
