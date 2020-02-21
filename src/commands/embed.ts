import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';
import { IFlag } from '../../lib/Interfaces';


export default class Embed extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'embed',
            aliases: [],
            assyst,
            cooldown: {
                timeout: 3500,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [{
                name: 'text',
                description: 'The text of the embed',
                argumented: true,
                permissionLevel: 0
            },
            {
                name: 'image',
                description: 'The image the embed should contain (URL)',
                argumented: true,
                permissionLevel: 0
            },
            {
                name: 'color',
                description: 'The hex color of the embed (eg #ABCDEF)',
                argumented: true,
                permissionLevel: 0
            },
            {
                name: 'footer',
                description: 'The footer of the embed',
                argumented: true,
                permissionLevel: 0
            }],
            info: {
                description: 'Create an embed, based off meta tags',
                examples: ['--text hello', '\n--image https://link.to.the/image.png', '--footer hello\n--text whats up\n--color abcdef'],
                usage: "<--text [text]>\n<--footer [footer]>\n<--color [hex color]>\n<--image [image link]>",
                author: "Jacherr, y21"
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        const url = new URL(this.assyst.apis.embedLink);
        if (context.flags.length === 0) {
            return context.reply(`Usage: \`\`\`md\n${this.assyst.defaultPrefix}${this.name} ${this.info.usage}\`\`\``, {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                }
            })
        }
        for (const flag of this.validFlags.map(v => v.name)) {
            if (context.checkForFlag(flag)) {
                url.searchParams.set(flag, <string>context.getFlag(flag)?.value);
            }
        }

        return context.reply(url.toString() + "&a=0", {
            storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            }
        });
    }
}