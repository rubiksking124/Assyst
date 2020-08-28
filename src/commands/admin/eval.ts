import { BaseAdminCommand } from '../baseadmincommand';
import { Command } from 'detritus-client';
import { ArgumentParser, Argument, ArgumentOptions } from 'detritus-client/lib/command';

export interface CommandArgs {
    code: string,
    noreply: boolean,
    depth: number,
    attach: boolean,
    async: boolean
}

export default class EvalCommand extends BaseAdminCommand {
    aliases = ['e']

    args = [
        {
            name: 'async',
            type: Boolean,
            default: false
        },
        {
            name: 'attach',
            type: Boolean,
            default: false
        },
        {
            name: 'depth',
            default: '0',
            type: String
        },
        {
            name: 'noreply',
            type: Boolean,
            default: false
        }
    ],

    label = 'code'

    name = 'eval'

    metadata = {
        description: 'Evaluate JavaScript',
        examples: ['1+1'],
        usage: '[code]'
    }

    run(context: Command.Context, args: CommandArgs) {

    }
}
