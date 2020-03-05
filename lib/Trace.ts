import { ITraceOptions, ICommandContext, ICommandOptions } from './CInterfaces';
import Command from './Command';
export default class Trace {
    private static nextIdentifier: number = 0
    public readonly thrownAt: Date
    public readonly guild: string
    public readonly context: ICommandContext
    public readonly command: Command
    public readonly identifier: number
    public readonly error: Error
    constructor(options: ITraceOptions) {
        this.thrownAt = options.thrownAt;
        this.guild = options.guild;
        this.command = options.command;
        this.context = options.context;
        this.error = options.error;
        this.identifier = Trace.nextIdentifier++;
    }
}