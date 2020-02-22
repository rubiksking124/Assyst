import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, PERMISSION_LEVELS } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';


export default class Stop extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'stop',
            aliases: ['die'],
            assyst,
            cooldown: {
                timeout: 0,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [{
                name: 'f',
                description: 'Kill the bot and do not restart the process',
                argumented: false,
                permissionLevel: PERMISSION_LEVELS.OWNER
            }],
            info: {
                description: 'Stops the bot',
                examples: [''],
                usage: "",
                author: "Jacherr"
            },
            permissionLevel: PERMISSION_LEVELS.OWNER
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        // If exit code is non-zero, process will restart
        // `-f` flag can be used to force stop the bot by exiting with code 0
        await context.reply(':wave:');
        if (context.checkForFlag('f')) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    }
}
