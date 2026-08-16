
import './telemetry';
import { buildApp } from './app';

const start = async () => {
  const server = await buildApp();

  const shutdown = async () => {
    server.log.info("Shutting down");
    await server.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  try {
    const defaultPort = process.env.NODE_ENV === 'development' ? 3420 : 3000;
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : defaultPort;
    await server.listen({ host: '0.0.0.0', port });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    server.log.error(err);
    process.exit(1);
  }
};

start().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
