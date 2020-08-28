import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

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
  args: [
    {
      name: 'wait',
      default: '0'
    }
  ],
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.screenshot) {
      return ctx.editOrReply('You need to supply a url to screenshot');
    }
    let wait: number;
    let nsfw: boolean;

    await ctx.triggerTyping();

    if (!ctx.channel) nsfw = false;
    else nsfw = ctx.channel.nsfw;

    wait = parseInt(args.wait);
    if (isNaN(wait) || wait < 0) wait = 0;
    else if (wait > 10000) wait = 10000;

    let response: Buffer | string;

    try {
      response = await assyst.fapi.screenshot(args.screenshot, { allowNSFW: nsfw, wait });
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
