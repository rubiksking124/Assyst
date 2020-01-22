import { IStaff, IEmotes } from './Interfaces'
import { tokens } from '../privateConfig.json'
import { description, version } from '../package.json'
export default class Config {
    public readonly prefix: string = ">>";
    public readonly staff: IStaff = {
        owners: ["233667448887312385"],
        admins: [],
        contributors: ["312715611413413889"]
    }
    public readonly emotes: IEmotes = {
        success: "<:greenTicklol:560210493936238604>",
        error: "<:redTicklol:560210501804752936>",
        loading: "<a:loading:572037397945253889>",
        info: "ℹ️"
    }
    public readonly description: string = description
    public readonly version: string = version
    public readonly tokens: object = tokens
}