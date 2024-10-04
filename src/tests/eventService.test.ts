import { initializeEvent, bookTicket, cancelBooking, getEventStatus } from '../services/eventService';
import { Event } from '../entities/Event';
import { Booking } from '../entities/Booking';
import { connectionOptions as AppDataSource } from '../config/database';

// Mock the TypeORM repositories and query runner
jest.mock('../config/database', () => ({
  connectionOptions: {
    getRepository: jest.fn(),
    createQueryRunner: jest.fn(),
  },
}));

describe('Event Service', () => {
  let mockEventRepository;
  let mockBookingRepository;
  let mockQueryRunner;

  beforeEach(() => {
    mockEventRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    mockBookingRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
    };
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Event) return mockEventRepository;
      if (entity === Booking) return mockBookingRepository;
    });
    (AppDataSource.createQueryRunner as jest.Mock).mockReturnValue(mockQueryRunner);
  });

  describe('initializeEvent', () => {
    it('should create a new event', async () => {
      const eventData = {
        name: 'Test Event',
        totalTickets: 100,
        availableTickets: 100,
      };
      const createdEvent = { ...eventData, id: 1 };

      mockEventRepository.create.mockReturnValue(createdEvent);
      mockEventRepository.save.mockResolvedValue(createdEvent);

      const result = await initializeEvent(eventData.name, eventData.totalTickets);

      expect(mockEventRepository.create).toHaveBeenCalledWith(eventData);
      expect(mockEventRepository.save).toHaveBeenCalledWith(createdEvent);
      expect(result).toEqual(createdEvent);
    });
  });

  describe('bookTicket', () => {
    it('should book a ticket successfully', async () => {
      const event = { id: 1, name: 'Test Event', totalTickets: 100, availableTickets: 1, bookings: [] };
      const booking = { id: 1, userId: 'user1', event, status: 'booked' };
      mockEventRepository.findOne.mockResolvedValue(event);
      mockBookingRepository.create.mockReturnValue(booking);
      mockBookingRepository.save.mockResolvedValue(booking);

      const result = await bookTicket(1, 'user1');

      expect(result.status).toBe(201);
      expect(result.message).toEqual(booking);
      expect(event.availableTickets).toBe(0);
    });

    it('should add to waiting list when no tickets available', async () => {
      const event = { id: 1, name: 'Test Event', totalTickets: 100, availableTickets: 0, bookings: [] };
      const waitingBooking = { id: 1, userId: 'user1', event, status: 'waiting' };
      mockEventRepository.findOne.mockResolvedValue(event);
      mockBookingRepository.create.mockReturnValue(waitingBooking);
      mockBookingRepository.save.mockResolvedValue(waitingBooking);

      const result = await bookTicket(1, 'user1');

      expect(result.status).toBe(200);
      expect(result.message).toBe('Added to waiting list');
    });

    it('should return 404 when event not found', async () => {
      mockEventRepository.findOne.mockResolvedValue(null);

      const result = await bookTicket(1, 'user1');

      expect(result.status).toBe(404);
      expect(result.message).toBe('Event not found');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking and assign to next in waiting list', async () => {
      const event = { id: 1, name: 'Test Event', totalTickets: 100, availableTickets: 0 };
      const booking = { id: 1, status: 'booked', event };
      const waitingBooking = { id: 2, status: 'waiting', event };
      mockBookingRepository.findOne
        .mockResolvedValueOnce(booking)
        .mockResolvedValueOnce(waitingBooking);

      const result = await cancelBooking(1);

      expect(result.status).toBe(200);
      expect(result.message).toBe('Booking cancelled, next in line assigned if applicable');
      expect(waitingBooking.status).toBe('booked');
    });

    it('should return 404 when booking not found', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      const result = await cancelBooking(1);

      expect(result.status).toBe(404);
      expect(result.message).toBe('Booking not found');
    });
  });

  describe('getEventStatus', () => {
    it('should return event status', async () => {
      const event = { id: 1, name: 'Test Event', totalTickets: 100, availableTickets: 50, bookings: [] };
      mockEventRepository.findOne.mockResolvedValue(event);
      mockBookingRepository.count.mockResolvedValue(5);

      const result = await getEventStatus(1);

      expect(result).toEqual({
        availableTickets: 50,
        waitingListCount: 5,
      });
    });

    it('should return 404 when event not found', async () => {
      mockEventRepository.findOne.mockResolvedValue(null);

      const result = await getEventStatus(1);

      expect(result.status).toBe(404);
      expect(result.message).toBe('Event not found');
    });
  });
});
