import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import { ChannelGuildText } from 'detritus-client/lib/structures';
import MessageSnipe from '../../structures/MessageSnipe';

export default {
    name: 'snipe',
    responseOptional: true,
    metadata: {
        description: 'Fetch the most recently deleted message from a channel',
        usage: '<channel mention|id>',
        examples: ['#general', '', '706974178171027459']
    },
    ratelimit: {
        type: 'guild',
        limit: 1,
        duration: 5000
    },
    run: async (assyst: Assyst, ctx: Context, args: any) => {
        let channel: ChannelGuildText | undefined
        try {
            if (!args || !args.snipe) {
                channel = await ctx.rest.fetchChannel(ctx.message.channelId)
            } else if (args.snipe.includes('#')) {
                let channelId: string = args.snipe.replace(/[<#|>]/g, '');
                if (channelId.split(' ').length > 1) {
                    return ctx.editOrReply('Your channel mention is invalid')
                }
                channel = await ctx.rest.fetchChannel(channelId);
            }
        } catch (e) {
            return ctx.editOrReply(e.message)
        }
        if(!channel) {
            return ctx.editOrReply('Channel not found')
        }
        const snipe = assyst.messageSnipeController.findRecentSnipeFromChannelId(channel.id);
        if(!snipe) {
            return ctx.editOrReply('No snipes recorded in this channel')
        }
        return ctx.editOrReply(snipe.content)
    }
};
