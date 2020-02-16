import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES, PERMISSION_LEVELS } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';
import { QueryResult } from 'pg';


export default class DeleteTag extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'deletetag',
            aliases: ['dt'],
            assyst,
            cooldown: {
                timeout: 5000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            info: {
                description: 'Delete a tag from the current guild',
                examples: ['hello'],
                usage: "[name]",
                author: "Jacherr"
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        if(!context.message.guild) {
            return null;
        }
        if(context.args.length < 1) {
            return context.reply(`Usage: \`\`\`md\n${this.assyst.prefix}${this.name} ${this.info.usage}\`\`\``, {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                }
            })
        }
        let res: QueryResult;
        try {
            res = await this.assyst.sql('delete from tags where guild = $1 and name = $2 and author = $3', [context.message.channel?.guild?.id, context.args[0], context.message.author.id])
            if(res.rowCount === 0) {
                return context.reply('You don\'t own this tag or it doesn\'t exist in this guild.', {
                    storeAsResponseForUser: {
                        user: context.message.author.id,
                        message: context.message.id
                    },
                    type: MESSAGE_TYPE_EMOTES.ERROR
                })
            }
        } catch(e) {
            return context.reply(e.message, {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.ERROR
            })
        }
        return context.reply('Tag deleted successfully.', {
            storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            },
            type: MESSAGE_TYPE_EMOTES.SUCCESS
        })
    }
}