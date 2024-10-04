
  // jest.setup.ts

jest.mock('typeorm', () => {
    const actualTypeORM = jest.requireActual('typeorm');
  
    return {
      ...actualTypeORM,
      PrimaryGeneratedColumn: jest.fn(() => target => target),
      Column: jest.fn(() => target => target),
      Entity: jest.fn(() => target => target),
      getRepository: jest.fn(),
    };
  });
  