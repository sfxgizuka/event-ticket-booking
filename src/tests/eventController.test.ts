import { Request, Response } from 'express';
import * as eventController from '../controllers/eventController';
import * as eventService from '../services/eventService';

jest.mock('../services/eventService');

describe('Event Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
      }),
    };
  });

  describe('initializeEvent', () => {
    it('should initialize an event and return 201 status', async () => {
      const mockEvent = { id: 1, name: 'Test Event', totalTickets: 100 };
      (eventService.initializeEvent as jest.Mock).mockResolvedValue(mockEvent);

      mockRequest.body = { name: 'Test Event', totalTickets: 100 };
      await eventController.initializeEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toEqual(mockEvent);
    });
  });

  describe('bookTicket', () => {
    it('should book a ticket and return the result', async () => {
      const mockResult = { status: 200, message: 'Ticket booked successfully' };
      (eventService.bookTicket as jest.Mock).mockResolvedValue(mockResult);

      mockRequest.body = { eventId: 1, userId: 1 };
      await eventController.bookTicket(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual('Ticket booked successfully');
    });

    it('should handle errors when booking a ticket', async () => {
      (eventService.bookTicket as jest.Mock).mockRejectedValue(new Error('Booking error'));

      mockRequest.body = { eventId: 1, userId: 1 };
      await eventController.bookTicket(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({ error: 'Error booking ticket' });
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking and return the result', async () => {
      const mockResult = { status: 200, message: 'Booking cancelled successfully' };
      (eventService.cancelBooking as jest.Mock).mockResolvedValue(mockResult);

      mockRequest.body = { bookingId: 1 };
      await eventController.cancelBooking(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual('Booking cancelled successfully');
    });

    it('should handle errors when cancelling a booking', async () => {
      (eventService.cancelBooking as jest.Mock).mockRejectedValue(new Error('Cancellation error'));

      mockRequest.body = { bookingId: 1 };
      await eventController.cancelBooking(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({ error: 'Error cancelling booking' });
    });
  });

  describe('getEventStatus', () => {
    it('should get event status and return 200 status', async () => {
      const mockStatus = { availableTickets: 50, bookedTickets: 50 };
      (eventService.getEventStatus as jest.Mock).mockResolvedValue(mockStatus);

      mockRequest.params = { eventId: '1' };
      await eventController.getEventStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual(mockStatus);
    });

    it('should handle errors when getting event status', async () => {
      (eventService.getEventStatus as jest.Mock).mockRejectedValue(new Error('Status error'));

      mockRequest.params = { eventId: '1' };
      await eventController.getEventStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({ error: 'Error retrieving event status' });
    });
  });
});
