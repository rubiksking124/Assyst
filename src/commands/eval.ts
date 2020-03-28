import { Context } from 'detritus-client/lib/command';

import { inspect } from 'util';

import Assyst from '../structures/Assyst';

export default {
  name: 'eval',
  responseOptional: true,
  editOrReply: true,
  onBefore: (context: Context) => context.client.isOwner(context.userId),
  run: async (assyst: Assyst, context: Context, args: any) => {
    let evaled: any;

    try {
      // eslint-disable-next-line no-eval
      evaled = await Promise.resolve(eval(args.eval));
    } catch (e) {
      return context.editOrReply(e.message);
    }

    if (typeof evaled === 'object') {
      evaled = inspect(evaled, { depth: 0, showHidden: true });
    } else {
      evaled = String(evaled);
    }

    evaled = evaled.split(context.client.token).join(' ');

    return context.editOrReply(`\`\`\`js\n${evaled}\`\`\``);
  }
};
