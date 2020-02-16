import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES, PERMISSION_LEVELS } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';
import { QueryResult } from 'pg';


export default class EditTag extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'edittag',
            aliases: ['et'],
            assyst,
            cooldown: {
                timeout: 5000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [{
                name: 'nsfw',
                argumented: false,
                description: 'Mark this tag as nsfw',
                permissionLevel: PERMISSION_LEVELS.NORMAL
            }],
            info: {
                description: 'Edit an existing tag',
                examples: ['hello Hello again!'],
                usage: "[name] [content]",
                author: "Jacherr"
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        if(!context.message.guild) {
            return null;
        }
        if(context.args.length < 2) {
            return context.reply(`Usage: \`\`\`md\n${this.assyst.prefix}${this.name} ${this.info.usage}\`\`\``, {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                }
            })
        }
        let nsfw: boolean = false
        if(context.checkForFlag('nsfw')) {
            nsfw = true
        }
        let res: QueryResult;
        try {
            res = await this.assyst.sql('update tags set content = $1, nsfw = $5 where guild = $2 and name = $3 and author = $4', [context.args.slice(1).join(' '), context.message.channel?.guild?.id, context.args[0], context.message.author.id, nsfw])
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
        return context.reply('Tag updated successfully.', {
            storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            },
            type: MESSAGE_TYPE_EMOTES.SUCCESS
        })
    }
}