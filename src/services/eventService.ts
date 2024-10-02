import { EntityManager, getRepository } from 'typeorm';
import { Event } from '../entities/Event';
import { Booking } from '../entities/Booking';
import { connectionOptions as AppDataSource } from '../config/database';
import { QueryRunner } from 'typeorm';

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
  const eventRepository = AppDataSource.getRepository(Event);
  const bookingRepository = AppDataSource.getRepository(Booking);
  
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const event = await eventRepository.findOne({
      where: { id: eventId },
      relations: ['bookings'],
    });

    if (!event) {
      await queryRunner.rollbackTransaction();
      return { status: 404, message: 'Event not found' };
    }

    if (event.availableTickets > 0) {
      const booking = bookingRepository.create({ userId, event });
      await bookingRepository.save(booking);

      // Decrement available tickets
      event.availableTickets -= 1;
      await eventRepository.save(event); 

      await queryRunner.commitTransaction();
      return { status: 201, message: booking };
    } else {
      const waitingBooking = bookingRepository.create({ userId, event, status: 'waiting' });
      await bookingRepository.save(waitingBooking);

      await queryRunner.commitTransaction();
      return { status: 200, message: 'Added to waiting list' };
    }
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw new Error(`Error booking ticket: ${error.message}`);
  } finally {
    await queryRunner.release();
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
