import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { server } from './src/__tests__/mocks/setupMSW';

expect.extend(matchers);

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});