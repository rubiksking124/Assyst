import { BaseCollection } from "detritus-client/lib/collections";
import MessageSnipe from "./MessageSnipe";
import Assyst from "./Assyst";

export default class MessageSnipeController {
    private messageSnipes: BaseCollection<string, MessageSnipe>
    private _assyst: Assyst

    constructor(assyst: Assyst) {
        this._assyst = assyst;
        this.messageSnipes = new BaseCollection({ limit: 500, expire: 30000 })
    }

    public findRecentSnipeFromChannelId(channelId: string): MessageSnipe | undefined {
        let validSnipes: MessageSnipe[] = []
        this.messageSnipes.forEach((snipe: MessageSnipe) => {
            const channel = snipe.sourceChannel;
            if(channel?.id === channelId) validSnipes.push(snipe)
        })
        return validSnipes.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime())[0]
    }

    public addSnipe(key: string, value: MessageSnipe): void {
        this.messageSnipes.set(key, value)
    }
}