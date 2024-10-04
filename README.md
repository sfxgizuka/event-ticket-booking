# Event Ticket Booking System

This project is an Event Ticket Booking System built with TypeScript, TypeORM, and Jest for testing.

## Setup and Running Instructions

1. Clone the repository:
```bash
git clone https://github.com/sfxgizuka/event-ticket-booking.git

cd event-ticket-booking

```
2. Install dependencies:

```bash
    npm install
```
3. Set up your database configuration in ormconfig.json or environment variables.

4. Run the migrations:
```bash
npm run typeorm migration:run
```
5. Start the server:
```bash
npm run start
```
## Testing
To run the tests, use the following command:
```bash
npm run test
```

The server will start running on http://localhost:3000.

## Design Choices
1. Entity Structure: The system uses three main entities: User, Event, and Booking. This separation allows for clear data management and relationships between users, events, and their bookings.

2. Optimistic Locking: The Event entity includes a version column, implementing optimistic locking to handle concurrent bookings and prevent race conditions.

3. Password Hashing: User passwords are hashed before insertion into the database, enhancing security.

4. TypeORM: Chosen for its powerful ORM capabilities and seamless integration with TypeScript.

5. Jest: Used for testing, with custom mocks for TypeORM to facilitate unit testing of database operations.

## API Documentation
### Users
- POST /api/users/register: Register a new user
    - Request Body:
    ```json
        {
            "username": "string",
            "password": "string"
        }
    ```

- POST /api/users/login: Login a user
    - Request Body:
    ```json
    {
        "username": "string",
        "password": "string"
    }
    ```



### Events
- GET /api/events/:eventId: Get a specific event
    - Parameters:
        - eventId: number

- POST /api/events/initialize: Create a new event
    - Request Body:
    ```json
    {   
        "name": "string",
        "totalTickets": "number",
    }
    ```
- POST /api/events/cancel: cancel a booking for an event
    - Request Body:
    ```json
    {
        "eventId": "number",
        "userId": "string"
    }
    ```

- POST /api/events/book: Book an event
    - Request Body:
    ```json
    {
        "eventId": "number",
        "userId": "string"
    }
    ```


## Logging
The application uses a logging system that outputs to logs/combined.log. This helps in monitoring the application's behavior and troubleshooting issues.

Note: The env was pushed to allow interviewer to run the app locally
