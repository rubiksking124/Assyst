import { ICooldown } from './Interfaces';
import { Guild, User, ChannelGuildText } from 'detritus-client/lib/structures';
import { COOLDOWN_TYPES } from './Enums'
import Command from './Command';

export default class CooldownManager { 
    private cooldowns: Map<string, ICooldown> // ID (of a user, channel or guild) => [Cooldown]
    constructor() {
        this.cooldowns = new Map();
    }

    public getCooldownFromId(id: string): ICooldown | null {
        return this.cooldowns.get(id) || null;
    }

    public getCooldownFromEntry(entry: ChannelGuildText | Guild | User): ICooldown | null {
        const value: [string, ICooldown] | undefined = Array.from(this.cooldowns).find(v => v[0] === entry.id);

        if (Array.isArray(value)) {
            return value[1];
        } else {
            return null;
        }
    }
    
    public addCooldown(endTime: number, id: string, type: COOLDOWN_TYPES, command: Command ): Map<string, ICooldown> {
        return this.cooldowns.set(id, {
            effectiveOn: type, 
            endUnix: endTime,
            sentMessage: false,
            command
        })
    }
}