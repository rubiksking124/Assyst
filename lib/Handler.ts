import { Message } from 'detritus-client/lib/structures';
import Assyst from './Assyst'
import Command from './Command'
import { IFlag, ICooldown, ICommandResponse } from './Interfaces';
import { PERMISSION_LEVELS, COOLDOWN_TYPES, MESSAGE_TYPE_EMOTES } from './Enums'
export default class Handler {
    public assyst: Assyst;

    constructor(client: Assyst) {
        this.assyst = client;
    }

    public handleMessage(message: Message): void {
        if (!message.channel || !message.channel.guild) return;

        const { content } = message;
        if (!content.startsWith(this.assyst.prefix) && !content.startsWith(`<@${this.assyst.bot.user?.id}>`) && !content.startsWith(`<@!${this.assyst.bot.user?.id}>`)) {
            return;
        }

        let [command, ...args] = content.substr(this.assyst.prefix.length).split(/ +/);
        if (!this.getCommand(command)) {
            return;
        }

        const targetCommand = <Command>this.getCommand(command);
        const permissionLevel: number = this.checkPermissions(message.author.id);
        if (permissionLevel /* user */ < targetCommand.permissionLevel) {
            return;
        }

        let idToCheck: string;
        switch (targetCommand.cooldown.type) {
            case COOLDOWN_TYPES.CHANNEL:
                idToCheck = message.channel.id;
                break;
            case COOLDOWN_TYPES.USER:
                idToCheck = message.author.id;
                break;
            case COOLDOWN_TYPES.GUILD:
                idToCheck = message.channel.guild.id;
                break;
        }

        const cooldown: ICooldown | null = this.assyst.cooldownManager.getCooldownFromId(idToCheck);
        if (cooldown && cooldown.endUnix > Date.now()) {
            if (!cooldown.sentMessage) {
                this.assyst.sendMsg(message.channel, `This command is on cooldown for ${((cooldown.endUnix - Date.now()) / 1000).toFixed(2)} more seconds.`, { type: MESSAGE_TYPE_EMOTES.ERROR })
                    .then((m: Message | null) => {
                        cooldown.sentMessage = true;
                        setTimeout(() => {
                            if (m) m.delete();
                        }, 5000);
                    });
            }
            return;
        } else {
            this.assyst.cooldownManager.addCooldown(Date.now() + targetCommand.cooldown.timeout, idToCheck, targetCommand.cooldown.type);
        }

        const flags: Array<IFlag> = this.resolveFlags(args, permissionLevel, targetCommand);
        args = this.removeFlags(args, flags)

        try {
            targetCommand.execute({
                args,
                message,
                flags,
                reply: this.assyst.sendMsg.bind(this.assyst, message.channelId)
            });
        } catch (e) {
            message.channel.createMessage(`:warning: Command raised an exception: \`\`\`js\n${e.stack}\n\`\`\``)
        }
    }

    public handleEditedMessage(message: Message) {
        this.updateResponseMessages(message);
        this.handleMessage(message);
    }

    public handleDeletedMessage(message: Message) {
        this.updateResponseMessages(message);
    }

    private updateResponseMessages(message: Message) {
        const responseMessageObject: ICommandResponse[] | undefined = this.assyst.responseMessages.get(message.author.id);
        if (responseMessageObject?.some(i => i.source.includes(message.id))) {
            const responseMessageId: string = <string>responseMessageObject?.find(i => i.source === message.id)?.response;
            const responseMessage: Message | undefined = message.channel?.messages.get(responseMessageId);
            if (responseMessage) {
                responseMessage.delete();
                this.removeResponseMessage(<ICommandResponse>this.assyst.responseMessages.get(message.author.id)?.find(i => i.source === message.id))
            }
        }
    }

    private removeResponseMessage(response: ICommandResponse): Map<string, ICommandResponse[]> {
        let responseMessage: [string, ICommandResponse[]] | undefined = Array.from(this.assyst.responseMessages).find(i => i[1].includes(response));
        if (responseMessage) {
            const position: number = responseMessage[1].indexOf(response);
            responseMessage[1].splice(position, 1);
            this.assyst.responseMessages.set(responseMessage[0], responseMessage[1]);
        }
        return this.assyst.responseMessages;
    }

    private resolveFlags(args: Array<string>, authorPermLevel: number, command: Command): Array<IFlag> {
        let flags: Array<IFlag> = [];

        for (let i = 0; i < args.length; i++) {
            if (args[i].startsWith('-') && args[i].length > 1 && !args[i].startsWith('--') && command.validFlags.filter(f => authorPermLevel >= f.permissionLevel).map(j => j.name).includes(args[i].substr(1, args[i].length))) {
                flags.push({
                    name: args[i].substr(1, args[i].length)
                });
            } else if (args[i].startsWith('--') && args[i].length > 1 && command.validFlags.filter(f => authorPermLevel >= f.permissionLevel).map(j => j.name).includes(args[i].substr(2, args[i].length))) {
                flags.push({
                    name: args[i].substr(2, args[i].length),
                    value: args[i + 1]
                });
            }
        }

        return flags;
    }

    private removeFlags(args: Array<string>, flagsToRemove: Array<IFlag>) {
        args.forEach(arg => {
            if (arg.startsWith('--') && flagsToRemove.map(i => i.name).includes(arg.slice(2))) {
                args.splice(args.indexOf(arg), 2);
            } else if (arg.startsWith('-') && flagsToRemove.map(i => i.name).includes(arg.slice(1))) {
                args.splice(args.indexOf(arg), 1);
            }
        });
        return args;
    }

    private checkPermissions(id: string): number {
        if (this.assyst.staff.owners.includes(id)) {
            return PERMISSION_LEVELS.OWNER;
        } else if (this.assyst.staff.admins.includes(id)) {
            return PERMISSION_LEVELS.ADMIN;
        } else {
            return PERMISSION_LEVELS.NORMAL;
        }
    }

    public storeCommandResponse(sourceMessageId: string, responseMessageId: string, user: string): Map<string, ICommandResponse[]> {
        let responseArray: Array<ICommandResponse>;
        if (this.assyst.responseMessages.get(user)) {
            responseArray = <Array<ICommandResponse>>this.assyst.responseMessages.get(user)
            responseArray.push({
                source: sourceMessageId,
                response: responseMessageId
            });
        } else {
            responseArray = [{
                source: sourceMessageId,
                response: responseMessageId
            }];
        }
        this.assyst.responseMessages.set(user, responseArray)
        return this.assyst.responseMessages
    }

    public getCommand(str: string): Command | null {
        const command: [string, Command] | undefined = Array.from(this.assyst.commands).find(([, cmd]) => cmd.name.toLowerCase() === str.toLowerCase()
            || cmd.aliases.some((a: string) => a.toLowerCase() === str.toLowerCase()));

        return command ? command[1] : null;
    }
}