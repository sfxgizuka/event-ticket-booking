import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';  // Import rate limiter
import eventRoutes from './routes/eventRoutes';
import { connectionOptions } from './config/database';

// Create Express app
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.',
  },
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// Routes
app.use('/api/events', eventRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Event Ticket Booking API');
});

// 404 Route
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

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
