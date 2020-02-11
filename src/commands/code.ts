import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message, VoiceCall } from 'detritus-client/lib/structures';
import superagent from 'superagent';
import { Markup } from 'detritus-client/lib/utils';
import { tokens } from '../../privateConfig.json'

interface CodeResult {
    data: {
        res: string,
        comp: number,
        timings: any[]
    },
    status: number
}

interface CodeList {
    status: number,
    data: Array<string>
}

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
        if(context.args[0] === 'list') {
            const langs: CodeList = await superagent
                .options(this.assyst.apis.code)
                .accept('application/json')
                .set('Authorization', tokens.gocodeit)
                .then((v: any) => JSON.parse(v.text))
            return context.reply(`Supported languages: ${langs.data.map((l: string) => `\`${l}\``).join(', ')}`, {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.INFO
            })
        }

        const processingMessage: Message | null = await context.reply('Processing...', {
            storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            },
            type: MESSAGE_TYPE_EMOTES.LOADING
        })
        let output: string;
        const res: CodeResult = await superagent
            .post(this.assyst.apis.code)
            .accept('application/json')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Authorization', tokens.gocodeit)
            .field('lang', context.args[0])
            .field('code', context.args
                .slice(1)
                .join(' ')
                .replace(/^```\w*|```$/g, ''))
            .then((v: any) => JSON.parse(v.text));
        if(res.data.res.length === 0) {
            output = "Empty Response"
        } else {
            output = res.data.res
        }
        if(!processingMessage) {
            return null;
        }
        if(output.length > 1995) {
            output = await this.utils.uploadToFilesGG(output, `code.${context.args[0]}`);
        }
        if (res.status === 200) {
            return context.reply(Markup.codeblock(output, { language: context.args[0], limit: 1990 }), {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                edit: processingMessage.id || undefined
            });
        } else {
            return context.reply(`HTTP Status: ${res.status} (${res.data.res})`, {
                storeAsResponseForUser: {
                    user: context.message.author.id,
                    message: context.message.id
                },
                type: MESSAGE_TYPE_EMOTES.ERROR,
                edit: processingMessage.id || undefined
            });
        }
    }
}