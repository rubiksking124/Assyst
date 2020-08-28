import Assyst from './src/structures/Assyst';

import { webhooks, token, commandClientOptions } from './config.json';

const client = new Assyst(token, commandClientOptions);

client.client.on('gatewayReady', () => {
  client.logger.info('Assyst is ready');
});

process.on('unhandledRejection', (err: any) => {
  if (err.response && err.response.statusCode === 429) return;
  client.fireErrorWebhook(webhooks.unhandledRejection.id, webhooks.unhandledRejection.token, 'Unhandled Rejection', 0xFF0000, err);
  console.error(err);
});

(async () => {
  await client.client.run();
})();
