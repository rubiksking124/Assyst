import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, REQUEST_TYPES, MESSAGE_TYPE_EMOTES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message, Attachment, User, MessageEmbedThumbnail } from 'detritus-client/lib/structures';


export default class OCR extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'ocr',
            aliases: [],
            assyst,
            cooldown: {
                timeout: 7500,
                type: COOLDOWN_TYPES.USER
            },
            validFlags: [],
            info: {
                description: 'Run Google Optical Character Recognition on an image',
                examples: ['https://link.to/the/image.png/', 'Jacher'],
                usage: "[url|user|attachment]",
                author: "Jacherr"
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        const processingMessage: Message | null = await context.reply('Processing...', { type: MESSAGE_TYPE_EMOTES.LOADING })
        let url: string;
        if (context.args.length === 0) {
            let attachment: MessageEmbedThumbnail | Attachment | undefined = await this.utils.getRecentAttachmentOrEmbed(context.message, this.assyst.searchMessages);
            if (attachment === undefined) {
                console.log(attachment)
                return context.reply(`Usage: \`\`\`md\n${this.assyst.prefix}${this.name} ${this.info.usage}\`\`\``, {
                    storeAsResponseForUser: {
                        user: context.message.author.id,
                        message: context.message.id
                    },
                    edit: processingMessage?.id,
                    type: MESSAGE_TYPE_EMOTES.INFO
                })
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
        const response = await this.request(`${this.assyst.apis.ocr}?q=${url}`, REQUEST_TYPES.GET);
        if (response?.status !== 200) {
            return context.reply('Google OCR returned an error.', {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                }, type: MESSAGE_TYPE_EMOTES.ERROR,
                edit: processingMessage?.id
            })
        } else {
            if (response.body.text.length > 1990) {
                const link = await this.utils.uploadToFilesGG(response.body.text, 'ocr.txt');
                return context.reply(link, {
                    storeAsResponseForUser: {
                        user: context.message.author.id,
                        message: context.message.id
                    },
                    edit: processingMessage?.id
                })
            } else if (response.body.text.length === 0) {
                return context.reply(`No text detected`, {
                    storeAsResponseForUser: {
                        user: context.message.author.id,
                        message: context.message.id
                    },
                    type: MESSAGE_TYPE_EMOTES.INFO,
                    edit: processingMessage?.id
                })
            } else {
                return context.reply(`\`\`\`${response.body.text}\`\`\``, {
                    storeAsResponseForUser: {
                        user: context.message.author.id,
                        message: context.message.id
                    },
                    edit: processingMessage?.id
                })
            }
        }
    }
}