import { tokens } from '../privateConfig.json';
import { IFlag } from './Interfaces';
import { promisify } from 'util';
import { unlink, writeFile } from 'fs';
import superagent from 'superagent';
import { Channel, Attachment, Message, MessageEmbedThumbnail } from 'detritus-client/lib/structures'
import Assyst from './Assyst.js';

const promisifyUnlink = promisify(unlink);
const promisifyWrite = promisify(writeFile);

export interface CodeResult {
    data: {
        res: string,
        comp: number,
        timings: any[]
    },
    status: number
}

export interface CodeList {
    status: number,
    data: Array<string>
}

export default class Utils {
    public assyst: Assyst;
    constructor(assyst: Assyst) {
        this.assyst = assyst;
    }

    public checkForFlag(flags: Array<IFlag>, flagName: string): boolean {
        const flagNames: Array<string> = flags.map((i: IFlag) => {
            return i.name
        })
        return flagNames.includes(flagName)
    }

    public getFlag(flags: Array<IFlag>, flagName: string): IFlag | null {
        return flags.find(i => i.name === flagName) || null;
    }

    public elapsed(value: number) {
        const date: Date = new Date(value);
        const elapsed = { days: date.getUTCDate() - 1, hours: date.getUTCHours(), minutes: date.getUTCMinutes(), seconds: date.getUTCSeconds() };
        return elapsed;
    }

    public async uploadToFilesGG(text: string, filename: string): Promise<string> {
        const data = new Uint8Array(Buffer.from(text) );
        await promisifyWrite(`${__dirname}/${filename}`, data);
        const response = await superagent.post('https://api.files.gg/files').type('form').attach('file', `${__dirname}/${filename}`);
        await promisifyUnlink(`${__dirname}/${filename}`);
        return response.body.urls.main;
    }  

    public async getRecentAttachmentOrEmbed(message: Message, amtOfMessages: number): Promise<MessageEmbedThumbnail | Attachment | undefined> {
        if(!message.channel) {
            return undefined;
        } else if(message.attachments.length > 0) {
            return message.attachments.first()
        }
        const messages: Array<Message> = await message.channel?.fetchMessages({limit: amtOfMessages})
        if(!messages) {
            return undefined;
        }
        let attachment: MessageEmbedThumbnail | Attachment | undefined
        messages.forEach(message => {
            if(message.attachments.first() !== undefined && attachment === undefined) {
                attachment = <Attachment>message.attachments.first()
            } else if(message.embeds.length > 0 && message.embeds.toArray()[0].thumbnail && attachment === undefined) {
                attachment = <MessageEmbedThumbnail>message.embeds.toArray()[0].thumbnail
            }
        })
        return attachment;
    }

    public async runSandboxedCode(language: string, code: string): Promise<CodeResult> {
        return superagent
            .post(this.assyst.apis.code)
            .accept('application/json')
            .set('Content-Type', 'application/json')
            .set('Authorization', tokens.gocodeit)
            .field('lang', language)
            .field('code', code)
            .field('timeout', "60")
            .then((v: any) => JSON.parse(v.text));
    }

    public async getLanguageList(): Promise<CodeList> {
        return superagent
            .options(this.assyst.apis.code)
            .accept('application/json')
            .set('Authorization', tokens.gocodeit)
            .then((v: any) => JSON.parse(v.text));
    }

    public snowflakeToTime(snowflake: string): number {
        const epoch: number = 1420070400000;
        const binary = (parseInt(snowflake, 10) ).toString(2).padStart(64, '0');
        return parseInt(binary.substring(0, 42), 2) + epoch;
    }
}