import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';
import superagent from 'superagent';
import { Markup } from 'detritus-client/lib/utils';

interface CodeResult {
    data: {
        res: string,
        comp: number,
        timings: any[]
    },
    status: number
}

export default class Cmd extends Command {
    constructor(assyst: Assyst) {
        super({
            name: 'code',
            aliases: [],
            assyst,
            cooldown: {
                timeout: 1000,
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
        const res: CodeResult = await superagent
            .post(this.assyst.apis.code)
            .accept('application/json')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .field('lang', context.args[0])
            .field('code', context.args
                .slice(1)
                .join(' ')
                .replace(/^```\w*|```$/g, ''))
            .then(v => JSON.parse(v.text));
        
        if (res.status === 200) {
            return context.reply(Markup.codeblock(res.data.res, { language: 'js', limit: 1990 }));
        } else {
            return context.reply('Underlying API returned an error.');
        }
    }
}