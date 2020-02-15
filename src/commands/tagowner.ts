import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES, PERMISSION_LEVELS } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';


export default class TagOwner extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'tagowner',
            aliases: ['ot'],
            assyst,
            cooldown: {
                timeout: 5000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            info: {
                description: 'View the owner of a tag.',
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
        const existingTags: Array<{guild: string}> = await this.assyst.sql('select guild from tags where name = $1', [context.args[0]]).then(r => r.rows)
        if(!existingTags.map(i => i.guild).includes(context.message.guild.id)) {
            return context.reply('This tag does not exist in this guild!', {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.ERROR
            })
        }
        let ownerID: string;
        try {
            ownerID = await this.assyst.sql('select author from tags where name = $1 and guild = $2', [context.args[0], context.message.guild.id]).then(r => r.rows[0].author)
        } catch(e) {
            return context.reply(e.message, {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.ERROR
            })
        }
        return context.reply(`Tag \`${context.args[0]}\` - owner: ${this.bot.users.get(ownerID) ? this.bot.users.get(ownerID) : `${ownerID} (not in guild)`}`, {
            storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            },
            type: MESSAGE_TYPE_EMOTES.INFO
        })
    }
}