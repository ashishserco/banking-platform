import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Global setup for tests
afterEach(() => {
    cleanup();
});
