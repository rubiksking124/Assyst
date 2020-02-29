import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES, REQUEST_TYPES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';
import { tokens } from '../../privateConfig.json';
import { createHash } from 'crypto';

export default class Screenshot extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'screenshot',
            aliases: ['ss'],
            assyst,
            argsMin: 1,
            cooldown: {
                timeout: 5000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            info: {
                description: 'Screenshot a web page',
                examples: ['https://google.com/', '127.0.0.1:3000'],
                usage: '[url|ip]',
                author: 'Jacherr'
            },
            nsfw: true
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        let site: any;
        const processingMessage: Message | null = await context.reply('Processing...', {
            type: MESSAGE_TYPE_EMOTES.LOADING, storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            }
        });
        try {
            site = await this.request(this.assyst.config.apis.fAPI, REQUEST_TYPES.POST, {
                'Authorization': tokens.fapi,
                'Content-Type': 'application/json',
            },
            {
                args: {
                    text: context.args[0],
                },
            });
        } catch (e) {
            return context.reply(e.response.text, { type: MESSAGE_TYPE_EMOTES.ERROR, edit: processingMessage?.id });
        }
        const hash = createHash('md5').update(site?.body).digest('hex');
        if (context.checkForFlag('viewhash')) {
            context.reply(hash, {
                type: MESSAGE_TYPE_EMOTES.INFO, storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                }
            });
        }
        if(!processingMessage) return null;
        switch (hash) {
        case 'fcab5a15e2ee436f8694b9777c3cb08b':
            return context.reply('No DNS records.', { type: MESSAGE_TYPE_EMOTES.ERROR, edit: processingMessage?.id });
        case '5991482f1a1d321eea4162044abbfd78':
            return context.reply('The domain does not exist.', { type: MESSAGE_TYPE_EMOTES.ERROR, edit: processingMessage?.id });
        case 'd4e18d5b499eedb1b3b62d93a669beb8':
            return context.reply('Connection refused.', { type: MESSAGE_TYPE_EMOTES.ERROR, edit: processingMessage?.id });
        case 'ab341be5ab990e3179bb6c4db954f702':
            return context.reply('(104) Connection reset by peer.', { type: MESSAGE_TYPE_EMOTES.ERROR, edit: processingMessage?.id });
        }
        processingMessage?.delete();
        return context.reply({ file: { data: site.body, filename: 'screenshot.png' } }, {
            storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            }
        });
    }
}