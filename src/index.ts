import Server from './server.js';

const server = new Server();

// Start the server
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default server;