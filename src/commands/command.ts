import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';


export default class Command_ extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'command',
            aliases: ['cmd'],
            assyst,
            cooldown: {
                timeout: 5000,
                type: COOLDOWN_TYPES.GUILD
            },
            argsMin: 1,
            validFlags: [],
            info: {
                description: 'Toggle a command\'s enabled status',
                examples: ['shodan'],
                usage: '[command]',
                author: 'Jacherr'
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        const command: Command | null = this.assyst.handler.getCommand(context.args[0]);
        if(!command) {
            return context.reply('This command doesn\'t exist.', {
                type: MESSAGE_TYPE_EMOTES.ERROR,
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                }
            });
        } else if(!command.canBeDisabled || command.permissionLevel > 1) {
            return context.reply('This command cannot be disabled.', {
                type: MESSAGE_TYPE_EMOTES.ERROR,
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                }
            });
        }
        const guildDisabledCommands: Array<string> = await this.assyst.sql('select command from disabled_commands where guild = $1', [context.message.guild.id]).then(r => r.rows.map(i => i.command));
        if(guildDisabledCommands.includes(command.name)) {
            await this.assyst.sql('delete from disabled_commands where guild = $1 and command = $2', [context.message.guild.id, command.name]);
            this.assyst.caches.disabledCommands.set(context.message.guild.id + command.name, false);
            return context.reply(`Command \`${command.name}\` has been re-enabled.`, {
                type: MESSAGE_TYPE_EMOTES.SUCCESS,
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                }
            });
        } else {
            await this.assyst.sql('insert into disabled_commands("guild", "command") values ($1, $2)', [context.message.guild.id, command.name]);
            this.assyst.caches.disabledCommands.set(context.message.guild.id + command.name, true);
            return context.reply(`Command \`${command.name}\` has been disabled.`, {
                type: MESSAGE_TYPE_EMOTES.SUCCESS,
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                }
            });
        }
    }
}