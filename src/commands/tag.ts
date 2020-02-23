import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES, PERMISSION_LEVELS } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';
import { Utils } from 'detritus-client';
const { Markup } = Utils;

export default class Tag extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'tag',
            aliases: ['t'],
            assyst,
            cooldown: {
                timeout: 3000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [{
                name: 'raw',
                description: 'View the raw content of this tag (unparsed)',
                permissionLevel: PERMISSION_LEVELS.NORMAL,
                argumented: false
            },
            {
                name: 'raw2',
                description: 'Upload the raw tag to files.gg',
                permissionLevel: PERMISSION_LEVELS.NORMAL,
                argumented: false
            },{
                name: 'files.gg',
                description: 'Upload the tag result to files.gg',
                permissionLevel: PERMISSION_LEVELS.NORMAL,
                argumented: false
            },{
                name: 'owner',
                description: 'Check who owns the tag in the current guild',
                permissionLevel: PERMISSION_LEVELS.NORMAL,
                argumented: false
            }],
            info: {
                description: 'View a tag',
                examples: ['hello'],
                usage: "[tag name]",
                author: "Jacherr"
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        const guildTags: Array<{ name: string, content: string, author: string, uses: number }> = await this.assyst.sql('select name, content, author, uses from tags where guild = $1', [context.message.channel?.guild?.id]).then(r => r.rows)
        const tag: { name: string, content: string, author: string, uses: number } | undefined = guildTags.find(i => i.name === context.args[0])
        if (!tag) {
            return context.reply('Tag not found.', {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.INFO
            })
        } else {
            context.message.channel?.triggerTyping()
            const sentArgs: string[] = context.args
            sentArgs.shift()
            let result: string
            if (context.checkForFlag('owner')) {
                result = `Tag \`${tag.name}\` - owner: ${this.bot.users.get(tag.author) ? this.bot.users.get(tag.author) : `${tag.author} (not in guild)`}`
            } else if (context.checkForFlag('raw2')) {
                result = (await this.utils.uploadToFilesGG(tag.content, `${tag.name}.txt`))
            } else if(context.checkForFlag('raw')) {
                result = `**Raw tag ${tag.name}:** ${Markup.codeblock(tag.content)}`
            } else {
                tag.uses++
                await this.assyst.sql('update tags set uses = $1 where name = $2 and guild = $3', [tag.uses, tag.name, context.message.channel?.guild?.id])
                result = (await this.assyst.parseNew(tag.content, context.message, context.args, { name: context.args[0], owner: tag.author })).result
            }
            if (result.length <= 0 || /^\s$/g.test(result)) {
                result = ':warning: `Tag returned an empty response.`'
            }
            if(context.checkForFlag('files.gg') && !context.checkForFlag('raw') && !context.checkForFlag('raw2') || result.length > 1995) {
                if(result.length < 200000) result = (await this.utils.uploadToFilesGG(result, `${tag.name}.txt`))
                else result = ':warning: `The tag output was longer than 200,000 characters, it will not be uploaded.`'
            }
            return context.reply(`​${result.trim()}`, { //zws escape in this result
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
            })
        }
    }
}