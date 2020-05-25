import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

import { homepage } from '../../../package.json';

export default {
  name: 'source',
  aliases: ['src'],
  responseOptional: true,
  metadata: {
    description: 'Fetch source code for a command or structure',
    usage: '<command|structure>',
    examples: ['ping', 'assyst']
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.source) {
      return ctx.editOrReply('You need to supply a command or structure name to fetch the source code for');
    }
    const command = assyst.findCommand(args.source);
    if (!command) {
      return ctx.editOrReply('Command not found');
    }
    return ctx.editOrReply(`${homepage}/tree/rewrite/src/commands/${command.metadata.category}/${command._file?.replace('js', 'ts')}`);
  }
};
