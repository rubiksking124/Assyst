import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, PERMISSION_LEVELS, REQUEST_TYPES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';

interface ParseResult {
    success: boolean,
    nsfw: boolean,
    attachments: Array<any> | null,
    imagescripts: Array<any> | null,
    result: string,
    timeTaken: number
}

export default class Test extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'test2',
            aliases: [],
            assyst,
            cooldown: {
                timeout: 500,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            info: {
                description: 'Parses text using [Cast](https://github.com/AssystDev/Cast) instead of the old parser',
                examples: [
                    '{pi}',
                    '{choose:1|5|9}'
                ],
                usage: '[text]',
                author: 'y21'
            },
            permissionLevel: PERMISSION_LEVELS.OWNER
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        const res: ParseResult = await this.assyst.request(this.assyst.config.apis.parser, REQUEST_TYPES.POST, {}, {
            input: context.args.join(' ')
        }).then(v => v?.body).catch(v => v.response.body);

        
        return context.reply((((res.success ? '' : ':warning:') + res.result) || '​:warning: `Tag returned an empty response.`') + '\n\n:stopwatch: Time taken: ' + (res.timeTaken / 1000) + ' µs', {
            storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            }
        });
    }
}