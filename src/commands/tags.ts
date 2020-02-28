import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES, PERMISSION_LEVELS } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';
import { Tag } from '../../lib/Interfaces';
import { QueryResult } from 'pg';

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
            },
            {
                name: 'mystats',
                description: 'Get stats about yourself on the tag system for the current guild',
                permissionLevel: PERMISSION_LEVELS.NORMAL,
                argumented: false
            }],
            info: {
                description: 'Get information about the tags in the current guild, or search for tags in the current guild',
                examples: ['', '-mystats', 'aaa'],
                usage: '<search param>',
                author: 'Jacherr'
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        if(context.checkForFlag('mystats')) {
            const usertags: Tag[] = await this.assyst.sql('select * from tags where guild = $1 and author = $2', [context.message.channel?.guild?.id, context.message.author.id]).then((r: QueryResult) => r.rows)
            const totalTags: number = usertags.length
            let totalUses: number
            if(usertags.length > 0) {
                totalUses = usertags.map(i => i.uses).reduce((ct: number, pt: number) => ct + pt)
            } else {
                totalUses = 0
            }
            const joinedServer: string = <string>context.message.member?.joinedAt?.toLocaleString()
            return context.reply({embed: {
                author: {
                    name: context.message.author.username,
                    iconUrl: context.message.author.avatarUrl
                },
                color: this.assyst.embedColour,
                title: `Tag stats: ${context.message.channel?.guild?.name}`,
                fields: [
                    {
                        name: 'Total tags',
                        value: totalTags.toString(),
                        inline: true
                    },
                    {
                        name: 'Total uses',
                        value: totalUses.toString(),
                        inline: true
                    },
                    {
                        name: 'Joined guild',
                        value: joinedServer,
                        inline: false
                    }
                ]
            }})
        }
        let tags: Tag[];
        let sort: string
        let ilike: string
        if(context.checkForFlag('alphabetical')) {
            sort = 'name asc'
        } else {
            sort = 'uses desc'
        }
        if(context.args.length > 0) {
            ilike = context.args[0]
        } else {
            ilike = ''
        }
        if (context.checkForFlag("mine")) {
            tags = await this.assyst.sql(`select * from tags where guild = $1 and author = $2 and name ilike $3 order by ${sort}`, [context.message.guildId, context.message.author.id, `%${ilike}%`])
                .then(v => v.rows);
        } else {
            tags = await this.assyst.sql(`select * from tags where guild = $1 and name ilike $2 order by ${sort}`, [context.message.guildId, `%${ilike}%`])
                .then(v => v.rows);
        }

        if (tags.length === 0) {
            return context.reply('This guild has no tags that match your query.', {
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
                            value: `**Owner:** ${context.message.guild.members.get(tag.author) ? context.message.guild.members.get(tag.author).user.username : `${tag.author} (not in this server)`}\n` +
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
