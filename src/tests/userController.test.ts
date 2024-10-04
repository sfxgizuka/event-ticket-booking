import { Request, Response } from 'express';
import * as userController from '../controllers/userController';
import { connectionOptions as AppDataSource } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../config/database', () => ({
  connectionOptions: {
    getRepository: jest.fn(),
  },
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('User Controller', () => {
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

  describe('signup', () => {
    it('should create a new user and return 201 status', async () => {
      const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword' };
      const mockRepository = {
        create: jest.fn().mockReturnValue(mockUser),
        save: jest.fn().mockResolvedValue(mockUser),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);

      mockRequest.body = { username: 'testuser', password: 'password123' };
      await userController.signup(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toEqual({ message: 'User created successfully' });
    });

    it('should handle errors when creating a user', async () => {
      const mockRepository = {
        create: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        }),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);

      mockRequest.body = { username: 'testuser', password: 'password123' };
      await userController.signup(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({ error: 'Error creating user' });
    });
  });

  describe('login', () => {
    it('should login a user and return a JWT token', async () => {
      const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword' };
      const mockRepository = {
        findOneBy: jest.fn().mockResolvedValue(mockUser),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      mockRequest.body = { username: 'testuser', password: 'password123' };
      await userController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({ token: 'mock_token' });
    });

    it('should return 401 for invalid credentials', async () => {
      const mockRepository = {
        findOneBy: jest.fn().mockResolvedValue(null),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);

      mockRequest.body = { username: 'testuser', password: 'password123' };
      await userController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 401 for incorrect password', async () => {
      const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword' };
      const mockRepository = {
        findOneBy: jest.fn().mockResolvedValue(mockUser),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      mockRequest.body = { username: 'testuser', password: 'wrongpassword' };
      await userController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({ error: 'Invalid credentials' });
    });

    it('should handle errors during login', async () => {
      const mockRepository = {
        findOneBy: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);

      mockRequest.body = { username: 'testuser', password: 'password123' };
      await userController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({ error: 'Error logging in' });
    });
  });
});
