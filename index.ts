import Assyst from './src/structures/Assyst';

import { webhooks } from './config.json';

const client = new Assyst();

client.commandClient.client.on('gatewayReady', () => {
  client.logger.info('Assyst is ready');
});

process.on('unhandledRejection', (err: any) => {
  client.fireErrorWebhook(webhooks.unhandledRejection.id, webhooks.unhandledRejection.token, 'Unhandled Rejection', 0xFF0000, err);
});

(async () => {
  await client.commandClient.client.run();
})();
