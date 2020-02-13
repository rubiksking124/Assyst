import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { PERMISSION_LEVELS, MESSAGE_TYPE_EMOTES, COOLDOWN_TYPES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';

const AsyncFunction = Object.getPrototypeOf(async () => { }).constructor

export default class Eval extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'e',
            aliases: [],
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
            },
            {
                name: 'files.gg',
                argumented: false,
                description: 'Upload the result to files.gg',
                permissionLevel: 2
            },
            {
                name: 'async',
                argumented: false,
                description: 'Run the evaluation asynchronously',
                permissionLevel: 2
            },
            {
                name: 'time',
                argumented: false,
                description: 'Measure the time taken to evaluate the code',
                permissionLevel: 2
            },
            {
                name: 'dm',
                argumented: false,
                description: 'Send Evalution to Direct Messages',
                permissionLevel: 2
            }
            ],
            info: {
                description: 'Evaluate js code',
                examples: ['1+1', 'this'],
                usage: "[code]",
                author: "Jacherr"
            },
            permissionLevel: PERMISSION_LEVELS.OWNER
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        let evaled;
        let start: number = Date.now();
        let time: number
        try {
            if (context.checkForFlag('async')) {
                const func = new AsyncFunction('context', context.args.join(' '));
                evaled = await func(this);
            } else {
                evaled = await Promise.resolve(eval(context.args.join(' '))); // eslint-disable-line no-eval
            }
            time = Date.now() - start
        } catch (err) {
            return this.sendMsg(context.message.channel, err.message, {
                type: MESSAGE_TYPE_EMOTES.ERROR, storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                }
            });
        }

        if (typeof evaled === 'object') {
            evaled = require('util').inspect(evaled, { depth: 0, showHidden: true });
        } else {
            evaled = String(evaled);
        }

        if (context.checkForFlag('noreply')) {
            return null;
        }

        evaled = evaled.split(this.bot.token).join(' ');

        const fullLen = evaled.length;

        if (fullLen === 0) {
            return null;
        }

        if(context.checkForFlag('time')) {
            context.reply(`Took ${time}ms`, {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.INFO
            })
        }

        if (context.checkForFlag('files.gg') || fullLen > 1990) {
            const link = await this.utils.uploadToFilesGG(evaled, 'evaloutput.js');
            return context.reply(link, {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                }
            })
        }

        if (context.checkForFlag('dm')) {
            const dmChannel = await context.message.author.createOrGetDm();
            if (dmChannel.canMessage) {
                return dmChannel.createMessage(`\`\`\`js\n${evaled}\`\`\``);
            }
        }

        return context.reply(`\`\`\`js\n${evaled}\`\`\``, {
            storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            }
        });
    }
}
