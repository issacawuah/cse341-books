// IT READS THE PORT AND LISTEN TO THE SERVER
// 2. have chang const port to var port because;
// See what ESLint can fix by itself and what you must fix by hand

import app from './app.js';
import { connectToDb } from './src/db/connect.js';

const PORT = process.env.PORT;

if (!PORT) {
  throw new Error('PORT is not defined. Make sure your local npm scripts reference the .env file with --env-file=.env, or define PORT in your hosted environment settings.');
}

const startServer = async () => {
  try {
    await connectToDb();

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

await startServer();