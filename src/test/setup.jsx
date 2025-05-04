import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import { setupServer } from 'msw/node';
import React from 'react'; // Add this import for JSX support
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import handlers from './mocks/handlers.jsx';

// Set up MSW
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test (important for test isolation)
afterEach(() => {
    server.resetHandlers();
    cleanup();
    vi.clearAllMocks();
});

// Close server after all tests
afterAll(() => server.close());

// Set up axios mock correctly for Vitest (as a fallback)
vi.mock('axios', () => {
    return {
        default: {
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
        },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    };
});

// Clean up after each test
afterEach(() => {
    cleanup();
});

// Create and export MSW server for API mocking
// (Removed duplicate declaration of server)

// Mock localStorage
export const mockLocalStorage = () => {
    const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    return localStorageMock;
};

// Create a custom render function that includes providers
export function renderWithProviders(ui, options = {}) {
    const {
        // Add any providers you commonly use here
        wrapper = ({ children }) => <React.Fragment>{children}</React.Fragment>,
    } = options;

    return {
        ...render(ui, { wrapper, ...options })
    };
}

// If you need to mock window.matchMedia (often needed for responsive components)
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock IntersectionObserver if you use it
class MockIntersectionObserver {
    constructor(callback) {
        this.callback = callback;
        this.elements = new Set();
    }

    observe(element) {
        this.elements.add(element);
    }

    unobserve(element) {
        this.elements.delete(element);
    }

    disconnect() {
        this.elements.clear();
    }

    // This method can be used in tests to trigger intersection callbacks
    triggerIntersect(isIntersecting) {
        const entries = [...this.elements].map(element => ({
            isIntersecting,
            target: element,
            intersectionRatio: isIntersecting ? 1 : 0,
        }));

        this.callback(entries, this);
    }
}

window.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver if you use it
class MockResizeObserver {
    constructor(callback) {
        this.callback = callback;
        this.elements = new Set();
    }

    observe(element) {
        this.elements.add(element);
    }

    unobserve(element) {
        this.elements.delete(element);
    }

    disconnect() {
        this.elements.clear();
    }
}

window.ResizeObserver = MockResizeObserver;