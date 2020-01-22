import { ShardClient } from 'detritus-client';
import Config from './Config'
export interface IAssystOptions {
    config: Config,
    bot: ShardClient
}