import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES, PERMISSION_LEVELS } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';

export default class Tags extends Command {
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
            }],
            info: {
                description: 'Get information about the tags in the current guild',
                examples: [""],
                usage: "",
                author: "Jacherr"
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        let guildTags: { name: string, author: string, uses: number }[] 
        let currentFlag: string = ''

        if(context.checkForFlag('mine')) {
            currentFlag = 'mine'
            guildTags = await this.assyst.sql('select name, author, uses from tags where guild = $1 and author = $2', [context.message.channel?.guild?.id, context.message.author.id]).then(r => r.rows)
        } else { 
            guildTags = await this.assyst.sql('select name, author, uses from tags where guild = $1', [context.message.channel?.guild?.id]).then(r => r.rows)
        }

        const totalTags: number = guildTags.length
        guildTags = guildTags.sort((a, b) => b.uses - a.uses).slice(0, 9)

        if(guildTags.length === 0) {
            return context.reply('No tags found.', {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.INFO
            })
        }

        let fields: { name: string, value: string, inline: boolean }[] = guildTags.map(t => {
            let value: string;
            switch(currentFlag) {
                case 'mine':
                        value = `**Uses:** ${t.uses.toString()}`
                    break;
                default:
                    value = `**Owner:** ${this.bot.users.get(t.author) ? this.bot.users.get(t.author) : `${t.author} (not in guild)`}\n**Uses:** ${t.uses.toString()}`
            }
            return { name: t.name, value, inline: true}
        })
        
        return context.reply({embed: {
            title: `Guild tags - ${context.message.channel?.guild?.name}`,
            fields,
            color: this.assyst.embedColour,
            footer: {
                text: `Total guild tags: ${totalTags}`
            }
        }})
    }
}