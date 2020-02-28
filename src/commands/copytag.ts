import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES, PERMISSION_LEVELS } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message, Guild } from 'detritus-client/lib/structures';


export default class CopyTag extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'copytag',
            aliases: ['cpt'],
            assyst,
            argsMin: 2,
            cooldown: {
                timeout: 10000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            info: {
                description: 'Copy an existing tag from a server to the current server.',
                examples: ['678368690072322064 hello', '678368690072322064 test test2'],
                usage: '[server id] [tag name] <new tag name>',
                author: 'Jacherr'
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        const sharedGuildIds: string[] = this.bot.guilds.filter((g: Guild) => g.members.map(i => i.id).includes(context.message.author.id)).map(i => i.id);
        if(!sharedGuildIds.includes(<string>context.message.guild?.id)) {
            return context.reply('You don\'t share a guild with the bot that has this ID.', {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.ERROR
            });
        }
        let newTagName: string;
        if(context.args[2]) {
            newTagName = context.args[2];
        } else {
            newTagName = context.args[1];
        }
        const existingTags: Array<{guild: string, author: string, content: string, nsfw: boolean}> = await this.assyst.sql('select guild, author, content, nsfw from tags where name = $1', [newTagName]).then(r => r.rows);
        const correctTag: {guild: string, author: string, content: string, nsfw: boolean} | undefined = existingTags.find(i => i.guild === context.args[0]) || undefined;
        if(existingTags.map(i => i.guild).includes(<string>context.message.guild?.id)) {
            return context.reply('A tag with this name already exists in the current guild.', {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.ERROR
            });
        } else if(!correctTag) {
            return context.reply('No tag with that name exists in the specified guild.', {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.ERROR
            });
        }

        try {
            await this.assyst.sql('insert into tags ("name", "content", "author", "createdat", "nsfw", "guild") values ($1, $2, $3, $4, $5, $6)', [newTagName, correctTag.content, context.message.author.id, new Date(), correctTag.nsfw, context.message.guild?.id]);
        } catch(e) {
            return context.reply(e.message, {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.ERROR
            });
        }
        return context.reply('Tag created successfully.', {
            storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            },
            type: MESSAGE_TYPE_EMOTES.SUCCESS
        });
    }
}