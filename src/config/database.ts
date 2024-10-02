import { DataSource } from 'typeorm';
import { Event } from '../entities/Event';
import { Booking } from '../entities/Booking';

export const connectionOptions = new DataSource({
  "type": "sqlite",
  "database": "database.sqlite",
  "synchronize": true,
  "logging": false,
  "entities": ["src/entities/*.ts"],
  "migrations": ["src/migrations/*.ts"],
  "subscribers": ["src/subscribers/*.ts"]
}
);