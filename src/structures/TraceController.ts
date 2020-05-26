import Trace from './Trace';
import Assyst from './Assyst';

import { randomBytes } from 'crypto';

export default class TraceController {
    private _traces: Map<string, Trace>
    private _lastClear: Date
    private readonly _assyst: Assyst

    static idLength: number = 10

    constructor (assyst: Assyst) {
      this._assyst = assyst;
      this._traces = new Map();
      this._lastClear = new Date();
    }

    get lastClear (): Date {
      return this._lastClear;
    }

    get tracesSize (): number {
      return this._traces.size;
    }

    public static generateId (): string {
      return randomBytes(this.idLength).toString('hex');
    }

    public getTrace (id: string): Trace | undefined {
      return this._traces.get(id);
    }

    public addTrace (id: string, trace: Trace): void {
      this._traces.set(id, trace);
    }

    public clearTraces (): void {
      this._traces.clear();
      this._lastClear = new Date();
    }
}
