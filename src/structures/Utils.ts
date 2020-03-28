import Assyst from './Assyst';

import { promisify } from 'util';
import { unlink, writeFile, createReadStream } from 'fs';

import fetch from 'node-fetch';

const promisifyUnlink = promisify(unlink);
const promisifyWrite = promisify(writeFile);

export default class Utils {
    private assyst: Assyst

    constructor (assyst: Assyst) {
      this.assyst = assyst;
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
