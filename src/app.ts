import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import eventRoutes from './routes/eventRoutes';
import { connectionOptions } from './config/database';

// Create Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/events', eventRoutes);

// Start the server and connect to the database
connectionOptions.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error during Data Source initialization', error);
  });

export default app;
