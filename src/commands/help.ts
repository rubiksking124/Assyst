import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES, PERMISSION_LEVELS } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message, MessageEmbed } from 'detritus-client/lib/structures';

export default class Help extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'help',
            aliases: [],
            assyst,
            cooldown: {
                timeout: 5000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [{
                name: 'flags',
                description: 'Check the flags of a command',
                permissionLevel: PERMISSION_LEVELS.NORMAL,
                argumented: false
            }],
            info: {
                description: 'Displays help about this bot\'s commands.',
                examples: ["", "ping", "dd -flags"],
                usage: '<command> <-flags>',
                author: 'y21'
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        if (context.args.length === 0) {
            /*const paging = await this.assyst.paginator.createReactionPaginator({
                message: context.message,
                pages: null
            });

            paging.on("next", () => {
                paging.commandMessage.edit(new Date().toLocaleString());
            });

            return null;*/
            return context.reply({
                embed: {
                    title: `${this.bot.user?.username}'s command list`,
                    description: `${Array.from(this.assyst.commands).filter(c => c[1].permissionLevel === 0).map(a => `**${a[1].name}** - ${a[1].info.description}`).join('\n')}`,
                    color: this.assyst.embedColour,
                    author: {
                        name: this.bot.user?.username,
                        iconUrl: this.bot.user?.avatarUrl
                    }
                }
            }, {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                }
            })
        } else {
            const command: Command | null = this.assyst.handler.getCommand(context.args[0])
            if (!command) {
                return context.reply('Command not found.', {
                    type: MESSAGE_TYPE_EMOTES.ERROR, storeAsResponseForUser: {
                        user: context.message.author.id,
                        message: context.message.id
                    }
                })
            }
            if (context.checkForFlag('flags')) {
                const flags: string = command.validFlags.map(f => {
                    let accepts: string
                    if (f.accepts && f.accepts?.length > 0) {
                        accepts = `\n*Accepts:* ${f.accepts.map(a => `\`${a}\``).join(', ')}`
                    } else if (f.argumented) {
                        accepts = '\n*Accepts:* Anything'
                    } else {
                        accepts = ''
                    }
                    return `**${f.name}** - ${f.description}${accepts}`
                }).join('\n\n')
                return context.reply({
                    embed: {
                        title: `${command.name} - flags`,
                        description: flags,
                        color: this.assyst.embedColour,
                        author: {
                            name: this.bot.user?.username,
                            iconUrl: this.bot.user?.avatarUrl
                        }
                    }
                }, {
                    storeAsResponseForUser: {
                        user: context.message.author.id,
                        message: context.message.id
                    }
                })
            }

            return context.reply({
                embed: {
                    description: command.info.description || '?',
                    title: command.name || '?',
                    color: this.assyst.embedColour || 0,
                    footer: {
                        text: 'Use the \'-flags\' flag to get more information on this command\'s flags.\nCommand parameters in <> are optional.'
                    },
                    author: {
                        name: this.bot.user?.username,
                        iconUrl: this.bot.user?.avatarUrl
                    },
                    fields: [
                        {
                            name: 'Usage',
                            value: `\`\`\`md\n${this.assyst.defaultPrefix}${command.name} ${command.info.usage}\`\`\``,
                            inline: true
                        },
                        {
                            name: 'Examples',
                            value: `\`\`\`fix\n${command.info.examples.map((e: string) => {
                                return `${this.assyst.defaultPrefix}${command.name} ${e}`
                            }).join('\n')}\`\`\``,
                            inline: true,
                        },
                        {
                            name: 'Cooldown',
                            value: `${(command.cooldown.timeout / 1000).toFixed(2)}s`,
                            inline: true
                        },
                        {
                            name: 'Flags',
                            value: `${command.validFlags.length > 0 ? command.validFlags.map(i => i.name).join(', ') : 'None'}`,
                            inline: true
                        }
                    ]
                }
            }, {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                }
            })
        }
        return null;
    }
}