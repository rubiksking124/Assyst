import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

import { admins } from '../../../config.json';

export default {
  name: 'command',
  aliases: ['cmd'],
  responseOptional: true,
  metadata: {
    description: 'Disable or enable a command',
    usage: '',
    examples: [''],
    cannotBeDisabled: true
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  onBefore: async (assyst: Assyst, ctx: Context) => {
    return ctx.client.isOwner(ctx.userId) || admins.includes(ctx.userId) || await assyst.db.checkIfUserIsGuildAdmin(<string> ctx.guildId, ctx.userId) || ctx.member?.isOwner;
  },
  run: async (assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.command) {
      return ctx.editOrReply('You need to provide a command to disable or re-enable');
    }
    const foundCommand = assyst.commands.find(c => c.name === args.command || c.aliases.includes(args.command));
    if (!foundCommand) {
      return ctx.editOrReply('No command found with this name or alias');
    } else if (foundCommand.metadata.cannotBeDisabled) {
      return ctx.editOrReply('This command can\'t be disabled');
    }
    const guildDisabledCommands = await assyst.db.getGuildDisabledCommands(<string> ctx.guildId);
    if (!guildDisabledCommands.includes(foundCommand.name)) {
      await assyst.db.disableGuildCommand(foundCommand.name, <string> ctx.guildId);
      return ctx.editOrReply(`The command \`${foundCommand.name}\` was disabled`);
    } else {
      await assyst.db.enableGuildCommand(foundCommand.name, <string> ctx.guildId);
      return ctx.editOrReply(`The command \`${foundCommand.name}\` was enabled`);
    }
  }
};
