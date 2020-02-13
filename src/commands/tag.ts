import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES } from '../../lib/Enums';
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
                timeout: 5000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            info: {
                description: 'View a tag',
                examples: ['hello'],
                usage: "[tag name]",
                author: "Jacherr"
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        const guildTags: Array<{name: string, content: string}> = await this.assyst.sql('select name, content from tags where guild = $1', [context.message.channel?.guild?.id]).then(r => r.rows)
        const tag: {name: string, content: string} | undefined = guildTags.find(i => i.name === context.args[0])
        if(!tag) {
            return context.reply('Tag not found.', {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.INFO
            })
        } else {
            return context.reply(Markup.escape.mentions(tag.content), {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
            })
        }
    }
}