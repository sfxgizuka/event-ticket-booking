import express from 'express';
import * as eventController from '../controllers/eventController';
import { validateRequest } from '../middlewares/validation/validateRequest';
import { initializeEventSchema, bookTicketSchema, cancelBookingSchema } from '../middlewares/validation/validationSchemas';
import { authenticate } from '../middlewares/auth/auth';

const router = express.Router();

// Initialize an event with validation
router.post('/initialize', validateRequest(initializeEventSchema), authenticate, eventController.initializeEvent);

// Book a ticket with validation
router.post('/book', validateRequest(bookTicketSchema), authenticate, eventController.bookTicket);

// Cancel a booking with validation
router.post('/cancel', validateRequest(cancelBookingSchema), authenticate, eventController.cancelBooking);

// Get event status does not require validation
router.get('/status/:eventId', authenticate, eventController.getEventStatus);

export default router;
