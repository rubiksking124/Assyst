import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';


export default class Cmd extends Command {
    constructor(assyst: Assyst) {
        super({
            name: '',
            aliases: [],
            assyst,
            cooldown: {
                timeout: 5000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            info: {
                description: '',
                examples: [],
                usage: '',
                author: ''
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        return context.message;
    }
}