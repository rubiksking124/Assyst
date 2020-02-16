import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';
import { message } from 'git-rev-sync';


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
            validFlags: [],
            info: {
                description: 'Get information about the tags in the current guild',
                examples: [],
                usage: "",
                author: "Jacherr"
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        let guildTags: { name: string, author: string, uses: number }[] = await this.assyst.sql('select name, author, uses from tags where guild = $1', [context.message.channel?.guild?.id]).then(r => r.rows)
        guildTags = guildTags.sort((a, b) => b.uses - a.uses).slice(0, 9)
        let fields: { name: string, value: string, inline: boolean }[] = guildTags.map(t => {
            return { name: t.name, value: `**Owner:** ${this.bot.users.get(t.author) ? this.bot.users.get(t.author) : `${t.author} (not in guild)`}\n**Uses:** ${t.uses.toString()}`, inline: true}
        })
        return context.reply({embed: {
            title: `Guild tags - ${context.message.channel?.guild?.name}`,
            fields,
            color: this.assyst.embedColour
        }})
    }
}