import { Request, Response } from 'express';
import * as eventService from '../services/eventService';

// Initialize an event
export const initializeEvent = async (req: Request, res: Response) => {
  const { name, totalTickets } = req.body;
  const event = await eventService.initializeEvent(name, totalTickets);
  res.status(201).json(event);
};

// Book a ticket
export const bookTicket = async (req: Request, res: Response) => {
  const { eventId, userId } = req.body;
  try {
    const result = await eventService.bookTicket(eventId, userId);
    res.status(result.status).json(result.message);
  } catch (error) {
    res.status(500).json({ error: 'Error booking ticket' });
  }
};

// Cancel a booking
export const cancelBooking = async (req: Request, res: Response) => {
  const { bookingId } = req.body;
  try {
    const result = await eventService.cancelBooking(bookingId);
    res.status(result.status).json(result.message);
  } catch (error) {
    res.status(500).json({ error: 'Error cancelling booking' });
  }
};

// Get event status
export const getEventStatus = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  try {
    const status = await eventService.getEventStatus(+eventId);
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving event status' });
  }
};
