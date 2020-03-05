import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, PERMISSION_LEVELS, MESSAGE_TYPE_EMOTES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';

export default class Trace extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'trace',
            aliases: ['tr'],
            assyst,
            cooldown: {
                timeout: 0,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            permissionLevel: PERMISSION_LEVELS.OWNER,
            info: {
                description: 'View recent traces or an individual trace.',
                examples: ['0', ''],
                usage: '<trace id>',
                author: 'Jacherr'
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        if(context.args.length > 0) {
            const trace = this.assyst.traces[parseInt(context.args[0])];
            if(!trace) {
                return context.reply('No trace found with this ID', {
                    type: MESSAGE_TYPE_EMOTES.ERROR,
                    storeAsResponseForUser: {
                        user: context.message.author.id,
                        message: context.message.id
                    }
                });
            } else {
                return context.reply({
                    embed: {
                        title: `Error Trace: ${trace.identifier}`,
                        description: `\`\`\`js\n${trace.error.stack}\n\`\`\``,
                        color: this.assyst.config.embedColour,
                        fields: [
                            {
                                name: 'Thrown At',
                                value: trace.thrownAt.toLocaleString(),
                                inline: true
                            },
                            {
                                name: 'Guild',
                                value: trace.guild,
                                inline: true
                            },
                            {
                                name: 'Command',
                                value: trace.command.name,
                                inline: true
                            },
                            {
                                name: 'Args',
                                value: trace.context.args.join(' ') || 'None',
                                inline: true
                            },
                            {
                                name: 'Flags',
                                value: (trace.context.flags.map(f => `${f.name} - ${f.value === null ? f.value : 'No argument'}`).join('\n')) || 'None',
                                inline: false
                            }
                        ]
                    }
                }, {
                    storeAsResponseForUser: {
                        user: context.message.author.id,
                        message: context.message.id
                    }
                });
            }
        } else {
            let pages: any[] = [];
            for(let i = 0; i < this.assyst.traces.length; i += 5) {
                let fields: any[] = [];
                this.assyst.traces.slice(i, i + 5).forEach((trace) => {
                    fields.push({
                        name: trace.identifier,
                        value: `\`\`\`${trace.error.message}\`\`\``,
                        inline: false
                    });
                });
                pages.push({embed: {
                    title: `Traces: Page ${(i / 5) + 1}`,
                    fields,
                    color: this.assyst.config.embedColour,
                    author: {
                        name: this.bot.user?.username,
                        iconUrl: this.bot.user?.avatarUrl
                    }
                }});
            }
            if(pages.length === 0) {
                return context.reply('There are no stored traces.', {
                    type: MESSAGE_TYPE_EMOTES.INFO,
                    storeAsResponseForUser: {
                        user: context.message.author.id,
                        message: context.message.id
                    }
                });
            }
            const paginator = await this.assyst.paginator.createReactionPaginator({
                message: context.message,
                pages
            });
            this.assyst.addResponseMessage(context.message, paginator.commandMessage.id);
            return paginator.commandMessage;
        }
    }
}