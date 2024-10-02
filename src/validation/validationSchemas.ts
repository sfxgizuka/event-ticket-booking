import Joi from 'joi';

// Schema for event initialization
export const initializeEventSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  totalTickets: Joi.number().integer().min(1).required(),
});

// Schema for booking a ticket
export const bookTicketSchema = Joi.object({
  eventId: Joi.number().integer().required(),
  userId: Joi.number().required(),
});

// Schema for canceling a booking
export const cancelBookingSchema = Joi.object({
  bookingId: Joi.number().integer().required(),
  eventId: Joi.number().integer().required(),
});
