import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import { beforeAll, afterAll, afterEach } from 'vitest';

// Create MSW server instance
export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());