import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { PERMISSION_LEVELS, MESSAGE_TYPE_EMOTES, COOLDOWN_TYPES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';

export default class Eval extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'eval',
            aliases: [ 'e' ],
            argsMin: 1,
            assyst,
            cooldown: {
                timeout: 0,
                type: COOLDOWN_TYPES.USER
            },
            validFlags: [{
                name: 'noreply',
                argumented: false,
                description: 'Do not reply to the evaluation',
                permissionLevel: 2
            }], //TODO: add more eval flags
            info: {
                description: 'Evaluate js code',
                examples: ['eval 1+1', 'eval this'],
                usage: "[code]",
                author: "Jacherr"
            },
            permissionLevel: PERMISSION_LEVELS.OWNER
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        let evaled;
        try {
            evaled = await Promise.resolve(eval(context.args.join(' ') ) ); // eslint-disable-line no-eval
        } catch (err) {
            return this.sendMsg(context.message.channel, err.message, { type: MESSAGE_TYPE_EMOTES.ERROR } );
        }

        if (typeof evaled === 'object') {
            evaled = require('util').inspect(evaled, { depth: 0, showHidden: true } );
        } else {
            evaled = String(evaled);
        }

        if(this.utils.checkForFlag('noreply', context.flags)) {
            return null;
        }

        evaled = evaled.split(this.bot.token).join(' ');

        const fullLen = evaled.length;

        if (fullLen === 0) {
            return null;
        }

        if (fullLen > 2000) { 
            this.sendMsg(context.message.channel, `\`\`\`js\n${evaled.slice(0, 1990)}\n\`\`\``);
        }
        return this.sendMsg(context.message.channel, `\`\`\`js\n${evaled}\`\`\``);
    }
}