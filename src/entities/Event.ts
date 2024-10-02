import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    VersionColumn,
    OneToMany
  } from 'typeorm';
  import { Booking } from './Booking';
  
  @Entity()
  export class Event {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column()
    totalTickets: number;
  
    @Column()
    availableTickets: number;
  
    // Add a version column for optimistic locking
    @VersionColumn() 
    version: number;
  
    @OneToMany(() => Booking, (booking) => booking.event)
    bookings: Booking[];
  }
  