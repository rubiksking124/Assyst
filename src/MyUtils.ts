import { Utils, AxonClient } from 'axoncore';

class MyUtils extends Utils {

    public static invite: RegExp = /^(discord.gg\/|discordapp.com\/invite\/)([a-z0-9]+)$/gi;

    constructor(client: AxonClient) {
        super(client);
    }

    public hexToRgb(hex: string) {
        let num: number;
        num = parseInt(hex.replace('#', ''), 16);
        return [num >> 16, num >> 8 & 255, num & 255]; // eslint-disable-line
    }

    public rgbToHex(red: number, green: number, blue: number) {
        return ((blue | green << 8 | red << 16) | 1 << 24).toString(16).slice(1); // eslint-disable-line
    }
}

export default MyUtils;
