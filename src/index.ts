import app from './server';

// Basic startup - will need to be enhanced with original startup logic
const port = process.env.PORT || 3000;

console.log(`🚀 Server running on port ${port}`);
console.log(`📝 API available at http://localhost:${port}/api`);
console.log(`📚 Docs available at http://localhost:${port}/doc`);

export default {
  port,
  fetch: app.fetch,
};