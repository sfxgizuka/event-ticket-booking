import express from 'express';
import * as eventController from '../controllers/eventController';
import { validateRequest } from '../validation/validateRequest';
import { initializeEventSchema, bookTicketSchema, cancelBookingSchema } from '../validation/validationSchemas';

const router = express.Router();

// Initialize an event with validation
router.post('/initialize', validateRequest(initializeEventSchema), eventController.initializeEvent);

// Book a ticket with validation
router.post('/book', validateRequest(bookTicketSchema), eventController.bookTicket);

// Cancel a booking with validation
router.post('/cancel', validateRequest(cancelBookingSchema), eventController.cancelBooking);

// Get event status does not require validation
router.get('/status/:eventId', eventController.getEventStatus);

export default router;
