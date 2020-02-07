import 'node-fetch';
import { tokens } from '../privateConfig.json';
import { IFlag } from './Interfaces';
import { promisify } from 'util';
import { unlink, writeFile } from 'fs';
import superagent from 'superagent';
import { Channel, Attachment, Message, MessageEmbedThumbnail } from 'detritus-client/lib/structures'

const promisifyUnlink = promisify(unlink);
const promisifyWrite = promisify(writeFile);

export default class Utils {
    public static fAPI: string = "https://fapi.wrmsr.io/";

    public async sendfAPIRequest(path: string, method: string, images: string[], args: object) {
        const result = await fetch(Utils.fAPI + path, {
            method,
            headers: {
                Authorization: `Bearer ${tokens.fapi}`
            },
            body: JSON.stringify({
                images,
                args
            })
        });

        if(!result.ok) {
            throw new Error(await (result).text());
        }
        return await (result.headers.get('content-type') === 'application/json' ? result.json() : result.arrayBuffer())
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
}