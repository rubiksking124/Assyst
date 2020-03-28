import { CommandClient } from 'detritus-client';

import { Pool, QueryResult } from 'pg';

import {
    token,
    db,
    commandClientOptions
} from '../../config.json';

export default class Assyst {

    public commandClient: CommandClient;
    public db: Pool

    constructor() {
        this.commandClient = new CommandClient(token, commandClientOptions);
        this.db = new Pool(db)
    }

    public sql(query: string, values?: any[]): Promise<QueryResult> {
        return new Promise((resolve, reject) => {
            this.db.query(query, values || [], (err: any, res: any) => {
                if (err) reject(err);
                else resolve(res);
            });
        });
    }

    get cc() {
        return this.commandClient;  // bc im lazy as hell
    }
}