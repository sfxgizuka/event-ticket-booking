import { DataSource } from 'typeorm';
import { Event } from '../entities/Event';
import { User } from '../entities/User';

export const mockDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  dropSchema: true,
  entities: [Event, User],
  synchronize: true,
  logging: false,
});
