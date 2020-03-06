import { IStaff, IEmotes, IStatusRota } from './Interfaces';
import { tokens } from '../privateConfig.json';
import { description, version } from '../package.json';

export default class Config {
    public readonly defaultPrefix: string = '<<';
    public readonly devModePrefix: string = '<>'
    public readonly staff: IStaff = {
        owners: ['233667448887312385', '312715611413413889'],
        admins: [],
        contributors: ['312715611413413889', '669784425147531268']
    };
    public readonly emotes: IEmotes = {
        success: '<:greenTicklol:560210493936238604>',
        error: '<:redTicklol:560210501804752936>',
        loading: '<a:loading:572037397945253889>',
        info: 'ℹ️'
    };
    public readonly apis = {
        fAPI: 'https://fapi.wrmsr.io',
        detritusDocsSearch: 'https://detritus-docs-api.y21.workers.dev',
        shodanSearch: 'https://shodan-search-api.y21.workers.dev',
        embedLink: 'https://discord-embed.y21.workers.dev',
        ocr: 'https://api.tsu.sh/google/ocr',
        code: 'https://api.gocode.it/exec/',
        identify: 'https://captionbot.azurewebsites.net/api/messages?language=en-US'
    };
    public readonly reactions = {
        previousPage: '⬅️',
        nextPage: '➡️'
    };
    public readonly paginatorTimeout: number = 120000;
    public readonly description: string = description;
    public readonly version: string = version;
    public readonly tokens = tokens;
    public readonly errorChannel: string = '412350028502269973';
    public readonly embedColour: number = 0xf4632e;
    public readonly searchMessages: number = 50;
    public readonly prefixCacheExpire: number = 86400000;
    public readonly statusRotas: IStatusRota = { statuses: [
        {
            name: '@Assyst help',
            type: 2
        },
        {
            name: 'you',
            type: 3
        },
        {
            name: 'in {guilds} guilds',
            type: 0
        },
        {
            name: 'for nsfw tags',
            type: 3
        },
        {
            name: 'the ram being eaten',
            type: 3
        },
        {
            name: 'cbt',
            type: 3
        },
        {
            name: 'people abuse the tag parser',
            type: 3
        },
        {
            name: 'message edits',
            type: 2
        },
        {
            name: '/dev/random',
            type: 1
        }
    ], delay: 15000 }
}