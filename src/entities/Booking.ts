import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Event } from './Event';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column({ default: 'booked' })
  status: string;

  @ManyToOne(() => Event, (event) => event.bookings)
  event: Event;
}
