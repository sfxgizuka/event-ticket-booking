import { Request, Response } from 'express';
import { connectionOptions as AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/env';

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = userRepository.create({ username, password });
    await userRepository.save(user);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ username });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
};
