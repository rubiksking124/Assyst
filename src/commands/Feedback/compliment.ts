import { Context } from 'detritus-client/lib/command';

import { feedbackChannels } from '../../../config.json';

import Assyst from '../../structures/Assyst';
import { Markup } from 'detritus-client/lib/utils';

export default {
  name: 'compliment',
  responseOptional: true,
  metadata: {
    description: 'Send a compliment to the support server',
    usage: '<compliment>',
    examples: ['bad bot']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 15000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const isBlacklisted = await assyst.db.checkIfUserIsFeedbackBlacklisted(ctx.userId);
    if (isBlacklisted) return;
    const complaint = args.compliment;
    if (!complaint) {
      return ctx.editOrReply('You need to supply a compliment to send');
    } else if (complaint.length < 10) {
      return ctx.editOrReply('You need to supply a compliment that is longer than 10 characters');
    } else if (complaint.length > 1500) {
      return ctx.editOrReply('You need to supply a compliment that is shorter than 1500 characters');
    }
    const [user, guild, channel] = await Promise.all([ctx.rest.fetchUser(ctx.userId), ctx.rest.fetchGuild(<string> ctx.guildId), ctx.rest.fetchChannel(ctx.channelId)]);
    ctx.rest.createMessage(feedbackChannels.compliments, `User: ${user.name}#${user.discriminator} (\`${user.id}\`)\nChannel: ${channel.name} (\`${channel.id}\`)\nGuild: ${guild.name} (\`${guild.id}\`)\nTime: ${new Date().toLocaleString()}\nCompliment: ${Markup.codeblock(complaint)}`);
    await ctx.editOrReply('Your compliment was sent!!');
  }
};
