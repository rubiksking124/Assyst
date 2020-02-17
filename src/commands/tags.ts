import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES, PERMISSION_LEVELS } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';
import { Tag } from '../../lib/Interfaces';

export default class Tags extends Command {
    public static entriesPerPage: number = 12;
    constructor(assyst: Assyst) {
        super({
            name: 'tags',
            aliases: ['ts'],
            assyst,
            cooldown: {
                timeout: 5000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [{
                name: 'mine',
                description: 'Get the list of tags that you own in this guild',
                permissionLevel: PERMISSION_LEVELS.NORMAL,
                argumented: false
            },
            {
                name: 'alphabetical',
                description: 'Order the tags alphabetically',
                permissionLevel: PERMISSION_LEVELS.NORMAL,
                argumented: false
            },
            {
                name: 'simple',
                description: 'Get a simple list of tags with no extra info',
                permissionLevel: PERMISSION_LEVELS.NORMAL,
                argumented: false
            }],
            info: {
                description: 'Get information about the tags in the current guild',
                examples: [],
                usage: '',
                author: 'Jacherr'
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        let tags: Tag[];
        let sort: string
        if(context.checkForFlag('alphabetical')) {
            sort = 'name asc'
        } else {
            sort = 'uses desc'
        }
        if (context.checkForFlag("mine")) {
            tags = await this.assyst.sql(`select * from tags where guild = $1 and author = $2 order by ${sort}`, [context.message.guildId, context.message.author.id])
                .then(v => v.rows);
        } else {
            tags = await this.assyst.sql(`select * from tags where guild = $1 order by ${sort}`, [context.message.guildId])
                .then(v => v.rows);
        }

        if (tags.length === 0) {
            return context.reply('This guild has no tags yet.', {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.INFO
            })
        }

        const pages = [];
        if(context.checkForFlag('simple')) {
            let currentEmbedSize: number = 0
            let currentPageTags: string[] = []
            for(const tag of tags) {
                if((currentEmbedSize + tag.name.length + 2) > 2000 || tag === tags[tags.length - 1]) {
                    pages.push({ embed: {
                        description: currentPageTags.join(', '),
                        color: this.assyst.embedColour
                    }})
                    currentPageTags = []
                    currentEmbedSize = 0
                } else {
                    currentPageTags.push(tag.name)
                    currentEmbedSize += tag.name.length + 2
                }
            }
        } else {
            for (let i = 0; i < tags.length; i += Tags.entriesPerPage) {
                pages.push({
                    embed: {
                        name: `Guild tags - ${context.message.guild?.name}`,
                        fields: tags.slice(i, i + Tags.entriesPerPage).map((tag: Tag) => ({
                            name: tag.name || "?",
                            value: `**Owner:** ${this.bot.users.get(tag.author) ? this.bot.users.get(tag.author) : `${tag.author} (not in this server)`}\n` +
                                `**Uses:** ${tag.uses}`,
                            inline: true
                        })),
                        color: this.assyst.embedColour,
                        footer: {
                            text: `Total guild tags: ${tags.length} | Page: ${(i / Tags.entriesPerPage) + 1}`
                        }
                    }
                });
            }
        }
        const paginator = await this.assyst.paginator.createReactionPaginator({
            message: context.message,
            pages
        });
        this.assyst.addResponseMessage(context.message, paginator.commandMessage.id)
        return paginator.commandMessage;
    }
}
