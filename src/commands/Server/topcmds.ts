import { Context } from 'detritus-client/lib/command';

import Assyst from '../../structures/Assyst';

import { Markup } from 'detritus-client/lib/utils';

interface CommandUseInfo {
    command: string,
    uses: string
}

export default {
  name: 'topcommands',
  aliases: ['topcmds', 'tcs'],
  responseOptional: true,
  metadata: {
    description: 'List the most used commands in this server',
    usage: '',
    examples: [''],
    minArgs: 0
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 10000
  },
  run: async (assyst: Assyst, ctx: Context) => {
    const commandUses = await assyst.db.getGuildCommandUses(<string>ctx.guildId);
    const rows: string[] = [];
    commandUses.forEach((c: CommandUseInfo) => {
      rows.push(`Command: ${c.command} ${'-'.repeat(20 - c.command.length)} Uses: ${c.uses}`);
    });
    ctx.editOrReply({
      embed: {
        title: 'Command usage stats in the current guild',
        description: Markup.codeblock(rows.slice(0, 15).join('\n'), { language: 'ml' }),
        color: 0xf4632e
      }
    });
  }
};
