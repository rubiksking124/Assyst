import { Message, ChannelGuildText, Guild, User } from 'detritus-client/lib/structures';
import Assyst from './Assyst';

export default class MessageSnipe {
    private readonly sourceMessage: Message
    public readonly modifiedAt: Date
    private readonly _assyst: Assyst
    private channel: ChannelGuildText | undefined
    private guild: Guild | undefined

    constructor (message: Message, modifiedAt: Date, assyst: Assyst) {
      this.sourceMessage = message;
      this.modifiedAt = modifiedAt;
      this._assyst = assyst;
    }

    get content (): string {
      return this.sourceMessage.content;
    }

    get author (): User {
      return this.sourceMessage.author;
    }

    get sourceChannel (): ChannelGuildText | undefined {
      return this.channel || undefined
    }

    public async fetchChannel (): Promise<ChannelGuildText | undefined> {
      if (!this.channel) {
        this.channel = await this._assyst.rest.fetchChannel(this.sourceMessage.channelId);
      }
      return this.channel;
    }

    public async fetchGuild (): Promise<Guild | undefined> {
      if (this.sourceMessage.guildId) {
        if (!this.guild) this.guild = await this._assyst.rest.fetchGuild(this.sourceMessage.guildId);
        return this.guild;
      } else return undefined;
    }
}
