import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';


export default class Cmd extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'invite',
            aliases: ['inv'],
            assyst,
            cooldown: {
                timeout: 5000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            info: {
                description: 'Get bot invite',
                examples: [''],
                usage: '',
                author: 'Jacherr'
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        return context.reply(`Invite the bot with this link: <${this.bot.application?.oauth2UrlFormat({ scope: 'bot', permissions: 0 })}>\nJoin the support server with this link: <https://jacher.io/assyst>`, {
            storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            }
        });
    }
}