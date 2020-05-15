import { Guild } from 'detritus-client/lib/structures';
import { Command, Context } from 'detritus-client/lib/command';

export interface TraceOptions {
    error: Error,
    thrownAt?: Date,
    args?: any,
    context?: Context
}

export default class Trace {
    public readonly thrownAt: Date
    public readonly stack: string | undefined
    public readonly message: string
    public readonly type: string
    public readonly args: any
    public readonly context: Context | undefined

    constructor (options: TraceOptions) {
      this.thrownAt = options.thrownAt || new Date();
      this.message = options.error.message;
      this.stack = options.error.stack;
      this.type = options.error.constructor.name;
      this.args = options.args || {};
      this.context = options.context;
    }
}
