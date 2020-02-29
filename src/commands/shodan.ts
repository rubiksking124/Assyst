import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { REQUEST_TYPES, COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';

export default class Shodan extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'shodan',
            aliases: [],
            assyst,
            cooldown: {
                timeout: 5000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            argsMin: 1,
            info: {
                description: 'Search shodan for hosts based on a search parameter', // todo
                examples: ['discord'],
                usage: '[query]',
                author: 'y21'
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        const message = await context.reply('Querying...', {
            type: MESSAGE_TYPE_EMOTES.LOADING, storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            }
        });
        const request = await this.request(this.assyst.config.apis.shodanSearch + '/?query=' + encodeURIComponent(context.args.join(' ')), REQUEST_TYPES.GET)
            .then(v => v?.body);
        if (!message) return null;
        if (request.hosts.length === 0) {
            return context.reply('No hosts were found for given query.', { edit: message.id, type: MESSAGE_TYPE_EMOTES.ERROR });
        } else {
            return context.reply(request.hosts.join('\n'), { edit: message.id });
        }
    }
}