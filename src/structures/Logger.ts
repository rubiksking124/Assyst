export default class Logger {
    private spacing: number

    constructor () {
      this.spacing = 5;
    }

    public info (content: string) {
      console.info(`${'='.repeat(this.spacing)} [INFO] ${content} ${'='.repeat(this.spacing)}`);
    }
}
