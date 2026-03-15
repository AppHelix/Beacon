export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:Anjali08*@localhost:5432/beacon',
  },
};
