import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES, PERMISSION_LEVELS } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';


export default class CreateTag extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'createtag',
            aliases: ['ct'],
            assyst,
            cooldown: {
                timeout: 10000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [{
                name: 'nsfw',
                argumented: false,
                description: 'Mark this tag as nsfw',
                permissionLevel: PERMISSION_LEVELS.NORMAL
            }],
            info: {
                description: 'Create a new tag. Parser documentation can be found [here](https://github.com/Jacherr/Assyst-TS/blob/master/PARSER_DOCS.md)',
                examples: ['hello Hello!'],
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
        const existingTags: Array<{guild: string}> = await this.assyst.sql('select guild from tags where name = $1', [context.args[0]]).then(r => r.rows)
        if(existingTags.map(i => i.guild).includes(context.message.guild.id)) {
            return context.reply('This tag already exists in this guild.', {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.ERROR
            })
        }
        let nsfw: boolean = false
        if(context.checkForFlag('nsfw')) {
            nsfw = true
        }
        try {
            await this.assyst.sql('insert into tags ("name", "content", "author", "createdat", "nsfw", "guild") values ($1, $2, $3, $4, $5, $6)', [context.args[0], context.args.splice(1).join(' '), context.message.author.id, new Date(), nsfw, context.message.guild?.id])
        } catch(e) {
            return context.reply(e.message, {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.ERROR
            })
        }
        return context.reply('Tag created successfully.', {
            storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            },
            type: MESSAGE_TYPE_EMOTES.SUCCESS
        })
    }
}