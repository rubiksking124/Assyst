import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message, VoiceCall } from 'detritus-client/lib/structures';
import { Markup } from 'detritus-client/lib/utils';
import { CodeResult, CodeList } from '../../lib/Utils';


export default class Code extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'code',
            aliases: [],
            assyst,
            argsMin: 1,
            cooldown: {
                timeout: 3000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            info: {
                description: 'Executes code in a given language',
                examples: ['js console.log("hello world")'],
                usage: '[language] [code]',
                author: 'y21'
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        if (context.args[0] === 'list') {
            const langs: CodeList = await this.assyst.utils.getLanguageList();
            return context.reply(`Supported languages: ${langs.data.map((l: string) => `\`${l}\``).join(', ')}`, {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.INFO
            });
        }

        const processingMessage: Message | null = await context.reply('Processing...', {
            storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            },
            type: MESSAGE_TYPE_EMOTES.LOADING
        });
        let output: string;
        let res: CodeResult;
        // run code
        try {
            res = await this.assyst.utils.runSandboxedCode(
                encodeURIComponent(context.args[0]),
                this.utils.removeCodeblock(context.args.slice(1).join(' '))
            );
        } catch (e) {
            let message: string;
            switch(e.status) {
            case 400:
                message = JSON.parse(e.response.text).data.res;
                break;  
            case 500:
                message = 'The API could not handle this request.';
                break;
            case 404:
                message = `Language ${context.args[0]} is not supported.`;
                break;
            default:
                message = 'An unexpected error occurred.';
                break;
            }
            return context.reply(`Error: ${e.status} - ${message}`, {
                edit: processingMessage?.id,
                type: MESSAGE_TYPE_EMOTES.ERROR
            });
        }

        if(!res.data.res && res.data.res !== '') {
            return context.reply(`Unexpected response from API: ${res.data.res}`, {
                type: MESSAGE_TYPE_EMOTES.ERROR,
                edit: processingMessage?.id
            });
        }

        if (res.data.res.length === 0) {
            output = 'Empty Response';
        } else {
            output = res.data.res;
        }

        if (!processingMessage) {
            return null;
        }

        let codeblock: boolean = true;

        if (output.length > 1995) {
            output = await this.utils.uploadToFilesGG(output, `code.${context.args[0]}`);
            output = `Output was too long, uploaded to files.gg: ${output}`;
            codeblock = false;
        } else if (output.length > 200000) {
            output = 'The output exceeded 200,000 characters. It will not be displayed.';
        }
        if (codeblock) {
            output = Markup.codeblock(output, { language: context.args[0], limit: 1990 });
        }
        if (res.status === 200) {
            return context.reply(output, {
                edit: processingMessage.id
            });
        } else {
            return context.reply(`HTTP Status: ${res.status} (${res.data.res})`, {
                type: MESSAGE_TYPE_EMOTES.ERROR,
                edit: processingMessage.id
            });
        }
    }
}
