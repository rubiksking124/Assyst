import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { PERMISSION_LEVELS } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces'
import { Message } from 'detritus-client/lib/structures'

export default class DetritusDocs extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'detritusdocs',
            aliases: [ 'dd' ],
            argsMin: 1,
            assyst,
            timeout: 3000,
            validFlags: [
                {
                    name: 'type',
                    description: '',
                    argumented: true,
                    permissionLevel: PERMISSION_LEVELS.NORMAL,
                    accepts: [
                        'interface',
                        'class'
                    ]
                }
            ],
            info: {
                description: 'Get information on an interface or class for detritusjs',
                examples: ['ShardClient', 'CallOptions --type interface', 'Message --type class'],
                usage: "[class|interface]",
                author: "a"
            }
        });
    }

    public execute(context: ICommandContext): Promise<Message> {
        return context.reply('test');
    }
}