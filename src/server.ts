import { Hono } from 'hono';
import { api } from './routes';

const app = new Hono();

// Keep exact same server setup as original
app.route('/api', api);

// TODO: Add middleware, error handling, etc. from original server.ts
// For now, this is a minimal setup to demonstrate the structure

export default app;