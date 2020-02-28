import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';
import { exec, ExecException } from 'child_process';

export default class Exec extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'exec',
            aliases: ['ex'],
            assyst,
            cooldown: {
                timeout: 5000,
                type: COOLDOWN_TYPES.GUILD
            },
            permissionLevel: 2,
            argsMin: 1,
            validFlags: [],
            info: {
                description: 'Execute bash commands',
                examples: ['lscpu'],
                usage: '[command]',
                author: 'Jacherr'
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        exec(context.args.join(' '), async (error: ExecException | null, stderr: string, stdout: string) => {

            if (error) return context.reply(error.message, {
                type: MESSAGE_TYPE_EMOTES.ERROR, storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                }
            });

            if (stderr) return context.reply(`\`\`\`bash\n${stderr.toString()}\`\`\``, {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                }
            });

            if (stdout === undefined) stdout = 'undefined';

            if (stdout.length > 1990) {
                const file: string = await this.utils.uploadToFilesGG(stdout, 'execoutput.js');
                return context.reply(file, {
                    storeAsResponseForUser: {
                        user: context.message.author.id,
                        message: context.message.id
                    }
                });
            }

            return context.reply(`\`\`\`bash\n${stdout} \`\`\``, {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                }
            });
        });
        return null;
    }
}