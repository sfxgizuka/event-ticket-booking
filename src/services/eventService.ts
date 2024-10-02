import { EntityManager, getRepository } from 'typeorm';
import { Event } from '../entities/Event';
import { Booking } from '../entities/Booking';
import { connectionOptions as AppDataSource } from '../config/database';

// Initialize an event
export const initializeEvent = async (name: string, totalTickets: number) => {
    const eventRepository = AppDataSource.getRepository(Event);
  
    // Create a new Event entity instance
    const event = eventRepository.create({
      name,
      totalTickets,
      availableTickets: totalTickets,
    });
  
    // Save the event to the database
    await eventRepository.save(event);
  
    return event;
  };

// Book a ticket
export const bookTicket = async (eventId: number, userId: string) => {
    try {
      return await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
        const event = await transactionalEntityManager.findOne(Event, {
          where: { id: eventId },
          relations: ['bookings'],
        });
  
        if (!event) {
          console.error('Event not found');
          return { status: 404, message: 'Event not found' };
        }
  
        // Check if tickets are available
        if (event.availableTickets > 0) {
          // Create and save the booking within the transaction
          const booking = transactionalEntityManager.create(Booking, { userId, event });
          await transactionalEntityManager.save(Booking, booking);
  
          // Decrement available tickets
          event.availableTickets -= 1;
  
          // Save the event using optimistic locking
          await transactionalEntityManager.save(Event, event);
  
          return { status: 201, message: booking };
        } else {
          // If no tickets are available, add to the waiting list
          const waitingBooking = transactionalEntityManager.create(Booking, { userId, event, status: 'waiting' });
          await transactionalEntityManager.save(Booking, waitingBooking);
  
          return { status: 200, message: 'Added to waiting list' };
        }
      });
    } catch (error) {
      if (error.name === 'OptimisticLockVersionMismatchError') {
        return { status: 409, message: 'Concurrency error: Another user booked the last ticket.' };
      }
      return { status: 500, message: 'Error booking ticket' };
    }
  };

// Cancel a booking
export const cancelBooking = async (bookingId: number) => {
  const bookingRepository = AppDataSource.getRepository(Booking);
  const booking = await bookingRepository.findOne({
    where: { id: bookingId },
    relations: ['event'],
  });

  if (!booking || booking.status !== 'booked') {
    return { status: 404, message: 'Booking not found' };
  }

  booking.status = 'cancelled';
  await bookingRepository.save(booking);

  // Check waiting list
  const nextInLine = await bookingRepository.findOne({
    where: { event: booking.event, status: 'waiting' },
  });

  if (nextInLine) {
    nextInLine.status = 'booked';
    await bookingRepository.save(nextInLine);
  } else {
    booking.event.availableTickets += 1;
    await bookingRepository.save(booking.event);
  }

  return { status: 200, message: 'Booking cancelled, next in line assigned if applicable' };
};

// Get event status
export const getEventStatus = async (eventId: number) => {
  const eventRepository = AppDataSource.getRepository(Event);
  const event = await eventRepository.findOne({ where: { id: eventId}, relations: ['bookings'] });

  if (!event) return { status: 404, message: 'Event not found' };

  const waitingListCount = await AppDataSource.getRepository(Booking).count({
    where: { event: event, status: 'waiting' },
  });

  return {
    availableTickets: event.availableTickets,
    waitingListCount,
  };
};
