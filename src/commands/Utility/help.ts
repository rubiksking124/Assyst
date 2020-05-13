import { Context } from 'detritus-client/lib/command';

import { readdirSync } from 'fs';

import Assyst from '../../structures/Assyst';

import { Utils, Command } from 'detritus-client';

const { Markup } = Utils;

export default {
  name: 'help',
  responseOptional: true,
  metadata: {
    description: 'Get help on the bot\'s commands or a specific command',
    usage: '<command>',
    examples: ['', 'ping'],
    minArgs: 0
  },
  ratelimit: {
    type: 'guild',
    limit: 1,
    duration: 5000
  },
  run: async (_assyst: Assyst, ctx: Context, args: any) => {
    if (!args || !args.help) return ctx.editOrReply('Command list: <https://assyst.axonteam.org/commands>\nJoin the Assyst discord server: <https://jacher.io/assyst>');
    const command = ctx.commandClient.commands.find(i => i.name === args.help || i.aliases.includes(args.help));
    if (command) {
      ctx.editOrReply({
        embed: {
          title: `Help: ${command.name}`,
          description: command.metadata.description,
          color: 0xf4632e,
          fields: [
            {
              name: 'Usage',
              value: command.metadata.usage !== undefined
                ? Markup.codeblock(`${ctx.prefix}${command.name} ${command.metadata.usage}`, {
                  language: 'css', limit: 1990
                })
                : 'No usage information found...',
              inline: false
            },
            {
              name: 'Examples',
              value: command.metadata.examples
                ? Markup.codeblock(command.metadata.examples.map((e: string) => `${ctx.prefix}${command.name} ${e}`).join('\n'), {
                  language: 'css',
                  limit: 1990
                })
                : 'No examples found...',
              inline: false
            },
            {
              name: 'Flags',
              value: command.args.args.length > 0 ? command.args.args.map(a => `Name: \`${a.name}\`, default value: \`${a.default}\``).join('\n') : 'None'
            }
          ]
        }
      });
    } else if (readdirSync('./src/commands').map(j => j.toLowerCase()).includes(args.help)) {
      let info: { description: string | undefined };
      try {
        info = await import(`../${args.help[0].toUpperCase() + args.help.slice(1).toLowerCase()}/category_info.js`).then(i => i.default);
      } catch (e) {
        throw new Error(`No category_info.ts file found for category ${args.help}`);
      }
      ctx.editOrReply({
        embed: {
          title: `Help - Category: ${args.help}`,
          description: info.description || 'No description found...',
          fields: [
            {
              name: 'Commands',
              value: ctx.commandClient.commands.filter((c: Command.Command) => {
                return c.metadata.category.toLowerCase() === args.help.toLowerCase();
              }).map((c: Command.Command) => {
                return `**${c.name}** - *${c.metadata.description || 'No description found...'}*`;
              }).join('\n')
            }
          ]
        }
      });
    } else if (!command) {
      return ctx.editOrReply('No command found');
    }
  }
};
