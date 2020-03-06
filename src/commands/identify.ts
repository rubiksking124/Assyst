import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, REQUEST_TYPES, MESSAGE_TYPE_EMOTES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { MessageEmbedThumbnail, Message, Attachment, User } from 'detritus-client/lib/structures';

export default class Identify extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'identify',
            aliases: [],
            assyst,
            cooldown: {
                timeout: 5000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            info: {
                description: 'Attempts to identify the contents of an image.',
                examples: ['https://link.to/the/image.png/', 'Jacher'],
                usage: '<user|attachment|image url>',
                author: 'Jacherr'
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        const processingMessage: Message | null = await context.reply('Processing...', {
            type: MESSAGE_TYPE_EMOTES.LOADING, storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            }
        });
        let url: string;
        if (context.args.length === 0) {
            let attachment: MessageEmbedThumbnail | Attachment | undefined = await this.utils.getRecentAttachmentOrEmbed(context.message, this.assyst.config.searchMessages);
            if (attachment === undefined) {
                return context.reply(`Usage: \`\`\`md\n${this.assyst.config.defaultPrefix}${this.name} ${this.info.usage}\`\`\``, {
                    edit: processingMessage?.id,
                    type: MESSAGE_TYPE_EMOTES.INFO
                });
            }
            url = <string>attachment.url;
        } else {
            const user: User | undefined = this.assyst.resolver.resolveUser(context.args[0]);
            if (!user) {
                url = context.args[0];
            } else {
                url = user.avatarUrl;
            }
        }
        try {
            const parsedURL: URL = new URL(url);
            url = parsedURL.origin + parsedURL.pathname;
        } catch (e) {
            return context.reply(`${e.message}`, {
                edit: processingMessage?.id,
                type: MESSAGE_TYPE_EMOTES.ERROR
            });
        }
        let response;
        try {
            response = await this.request(this.assyst.config.apis.identify, REQUEST_TYPES.POST, {
                'Content-Type': 'application/json'
            },
            {
                Type: 'CaptionRequest',
                Content: url
            });
            if(!response) throw new Error('The response was null');
        } catch(e) {
            return context.reply(e.message, {
                type: MESSAGE_TYPE_EMOTES.ERROR,
                edit: processingMessage?.id
            });
        }
        return context.reply(`\`\`\`\n${response.text}\`\`\``, {
            edit: processingMessage?.id
        });
    }
}