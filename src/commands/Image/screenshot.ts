import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';
import FapiRestClient from '../../rest/clients/Fapi';

import { createHash } from 'crypto';

export default {
  name: 'screenshot',
  aliases: ['ss'],
  responseOptional: true,
  metadata: {
    description: 'Screenshot a webpage',
    usage: '[url]',
    examples: ['google.com']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    const restClient: FapiRestClient | undefined = <FapiRestClient | undefined> assyst.customRest.clients.get('fapi');
    let nsfw: boolean;
    if (!restClient) throw new Error('There is no fapi client present in the rest controller');
    await ctx.triggerTyping();
    if (!ctx.channel) nsfw = false;
    else nsfw = ctx.channel.nsfw;
    let response: Buffer | string;
    try {
      response = await restClient.screenshot(args.screenshot, nsfw);
    } catch (e) {
      return ctx.editOrReply(e.message);
    }
    if (typeof response === 'string') {
      return ctx.editOrReply(response);
    }
    const hash = createHash('md5').update(response).digest('hex');
    switch (hash) {
      case 'fcab5a15e2ee436f8694b9777c3cb08b':
        return ctx.editOrReply('No DNS records');
      case '5991482f1a1d321eea4162044abbfd78':
        return ctx.editOrReply('The domain does not exist');
      case 'd4e18d5b499eedb1b3b62d93a669beb8':
        return ctx.editOrReply('Connection refused');
      case 'ab341be5ab990e3179bb6c4db954f702':
        return ctx.editOrReply('Connection reset by peer');
    }
    return ctx.reply({ file: { data: response, filename: 'screenshot.png' } });
  }
};
