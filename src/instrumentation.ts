export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Database migrations are now handled by Drizzle Kit for PostgreSQL
    // Run: npx drizzle-kit push
    console.log('Using Neon PostgreSQL with Drizzle Kit migrations');

    await import('./lib/config/index');
  }
};
