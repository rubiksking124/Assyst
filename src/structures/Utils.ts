import Assyst from './Assyst';

import { promisify } from 'util';
import { unlink, writeFile, createReadStream } from 'fs';

import fetch from 'node-fetch';

const promisifyUnlink = promisify(unlink);
const promisifyWrite = promisify(writeFile);

export interface MetricItem {
  name: string,
  value: string
}

export interface MetricItemFormat {
  item: string,
  format: Function
}

interface ElapsedTime {
  seconds: number,
  minutes: number,
  hours: number,
  days: number
}

export default class Utils {
    private assyst: Assyst

    constructor (assyst: Assyst) {
      this.assyst = assyst;
    }

    public elapsed (value: number): ElapsedTime {
      const date: Date = new Date(value);
      const elapsed = { days: date.getUTCDate() - 1, hours: date.getUTCHours(), minutes: date.getUTCMinutes(), seconds: date.getUTCSeconds() };
      return elapsed;
    }

    public formatMetricList (items: MetricItem[], separatorValue: number = 15, formatItems?: MetricItemFormat[]): string {
      let longestVal = 0;
      items.forEach((item: MetricItem) => {
        if (item.name.length > longestVal) longestVal = item.name.length;
      });
      if (longestVal > separatorValue) separatorValue = longestVal;
      let returnString = '';
      items.forEach((i: MetricItem) => {
        if (!formatItems || !formatItems.map(i => i.item).includes(i.name)) {
          returnString += `${i.name} ${'-'.repeat(separatorValue - i.name.length)} ${i.value}\n`;
        } else {
          returnString += `${i.name} ${'-'.repeat(separatorValue - i.name.length)} ${formatItems.find(j => j.item === i.name)?.format(i.value)}\n`;
        }
      });
      return returnString;
    }

  /* public async uploadToFilesGG (text: string, filename: string): Promise<string> { // TODO: fix this
      const fd = new FormData();
      fd.append('file', createReadStream(`${__dirname}/${filename}`));

      fetch('https://api.files.gg/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        body: fd
      });
    } */
}
