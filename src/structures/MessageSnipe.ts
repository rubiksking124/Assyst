import { Message, ChannelGuildText, Guild, User } from 'detritus-client/lib/structures';
import Assyst from './Assyst';

export enum MessageSnipeTypes {
    DELETE,
    EDIT
}

export default class MessageSnipe {
    private readonly _sourceMessage: Message
    public readonly modifiedAt: Date
    public readonly type: MessageSnipeTypes
    private readonly _assyst: Assyst

    constructor (message: Message, modifiedAt: Date, type: MessageSnipeTypes, assyst: Assyst) {
      this._sourceMessage = message;
      this.modifiedAt = modifiedAt;
      this.type = type;
      this._assyst = assyst;
    }

    get content (): string {
      return this._sourceMessage.content;
    }

    get author (): User {
      return this._sourceMessage.author;
    }

    public async fetchChannel (): Promise<ChannelGuildText> {
      return await this._assyst.rest.fetchChannel(this._sourceMessage.channelId);
    }

    public async fetchGuild (): Promise<Guild | undefined> {
      if (this._sourceMessage.guildId) {
        return await this._assyst.rest.fetchGuild(this._sourceMessage.guildId);
      } else return undefined;
    }
}
