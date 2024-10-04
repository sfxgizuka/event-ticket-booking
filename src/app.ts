import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import eventRoutes from './routes/eventRoutes';
import { connectionOptions } from './config/database';
import userRoutes from './routes/userRoutes'
import { PORT } from './utils/env';
import logger from './utils/logger';

const app = express();

app.use(bodyParser.json());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    error: 'Too many requests, please try again later.',
  },
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/user', userRoutes)

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Event Ticket Booking API');
});

// 404 Route
app.use((req, res) => {
  logger.warn(`404 - Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Not Found' });
});

// Start the server and connect to the database
connectionOptions.initialize()
  .then(() => {
    logger.info('Data Source has been initialized!');

    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('Error during Data Source initialization', error);
  });

export default app;
