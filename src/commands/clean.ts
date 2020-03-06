import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';


export default class Clean extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'clean',
            aliases: ['c'],
            assyst,
            cooldown: {
                timeout: 5000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            info: {
                description: 'Cleanup command messages and responses',
                examples: ['', '100'],
                usage: '<amount of command responses to clean>',
                author: 'Jacherr'
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        return context.message; //todo
    }
}