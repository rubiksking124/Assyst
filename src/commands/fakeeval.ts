import Command from '../../lib/Command';
import Assyst from '../../lib/Assyst';
import { COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES } from '../../lib/Enums';
import { ICommandContext } from '../../lib/CInterfaces';
import { Message } from 'detritus-client/lib/structures';
import { CodeResult } from '../../lib/Utils';
import { Markup } from 'detritus-client/lib/utils';


export default class FakeEval extends Command {
    public prependedCode: string = `(function() {
        const Collection = Map;
        
        function rand(min, max) {
            return Math.floor(Math.random() * (max - min)) + min
        }
        
        function populate() {
            return [new Array(19).fill().map(() => Math.random().toString()[2]).join(""), {
                name: String.fromCharCode(rand(65, 127)).repeat(10)
            }];
        }
        
        this.client = {
            channels: new Collection(new Array(${this.bot.channels.size}).fill().map(populate)),
            guilds: new Collection(new Array(${this.bot.guilds.size}).fill().map(populate)),
            users: new Collection(new Array(${this.bot.users.size}).fill().map(populate)),
            token: "NTcxNjYxMjIxODU0NzA3NzEz.Dvl8Dw.aKlcU6mA69pSOI_YBB8RG7nNGUE",
            uptime: process.uptime()
        };
    }).call(global);
    
    console.log(eval("{input}"));`;
    constructor(assyst: Assyst) {
        super({
            name: 'eval',
            aliases: [],
            assyst,
            cooldown: {
                timeout: 5000,
                type: COOLDOWN_TYPES.GUILD
            },
            validFlags: [],
            info: {
                description: 'Evaluates JavaScript code (real!!!1)',
                examples: ['1+1', 'this'],
                usage: '[code]',
                author: 'y21'
            }
        });
    }

    public async execute(context: ICommandContext): Promise<Message | null> {
        /* FAKE EVAL */
        const res: CodeResult = await this.assyst.utils.runSandboxedCode('js', this.prependedCode.replace('{input}', context.args.join(' ').replace(/"/g, '\'')));
        return context.reply(Markup.codeblock(res.data.res.substr(0, 1980), { language: 'js' }), {
            storeAsResponseForUser: {
                user: context.message.author.id,
                message: context.message.id
            },
        });
    }
}