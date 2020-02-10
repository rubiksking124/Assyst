import { IStaff, IEmotes } from './Interfaces';
import { tokens } from '../privateConfig.json';
import { description, version } from '../package.json';

export default class Config {
    public readonly prefix: string = '<<';
    public readonly staff: IStaff = {
        owners: ["233667448887312385", "312715611413413889"],
        admins: [],
        contributors: ["312715611413413889"]
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
        code: 'https://api.gocode.it/exec/'
    };
    public readonly reactions = {
        previousPage: "⬅️",
        nextPage: "➡️"
    };
    public readonly paginatorTimeout: number = 120000;
    public readonly description: string = description;
    public readonly version: string = version;
    public readonly tokens = tokens;
    public readonly errorChannel: string = '412350028502269973';
    public readonly embedColour: number = 0xf4632e;
    public readonly searchMessages: number = 50;
}