import Dashboard from '@/components/Dashboard';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Create a variable to control the mock's behavior
let mockSelectedCharacter = null;

// Mock userContext BEFORE any imports that might use it
vi.mock('../context/userContext', () => {
    const refreshDataMock = vi.fn();
    const setSelectedCharacterMock = vi.fn();

    return {
        // Export UserProvider as a component that renders its children
        UserProvider: ({ children }) => children,

        // Export useUser hook with dynamic mock data
        useUser: () => ({
            // This will use the variable we control from the test
            selectedCharacter: mockSelectedCharacter,
            setSelectedCharacter: setSelectedCharacterMock,
            refreshData: refreshDataMock
        })
    };
});

// Mock react-router-dom AFTER the imports
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn()
    };
});

// Import the mocked versions AFTER the vi.mock calls
import { useUser } from '../context/userContext';

describe('Dashboard Component', () => {
    // Define the mock character that will be used
    const mockCharacter = {
        characterId: 1,
        name: 'TestHero',
        class: 'Warrior',
        level: 5,
        experience: 1000,
        gold: 500,
        imageUrl: '/assets/images/warrior.jpg'
    };

    beforeEach(() => {
        vi.resetAllMocks();

        // Set mockSelectedCharacter to null initially to test loading state
        mockSelectedCharacter = null;

        // Mock localStorage token
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: (key) => key === 'authToken' ? 'fake-token' : null,
                setItem: vi.fn(),
                removeItem: vi.fn()
            },
            writable: true
        });

        // Mock window.location.pathname
        Object.defineProperty(window, 'location', {
            value: { pathname: '/dashboard' },
            writable: true
        });

        // Mock axios to delay response - this ensures loading state is visible
        axios.get.mockImplementation(() => {
            return new Promise(resolve => {
                // Return a promise that resolves after a short delay
                setTimeout(() => {
                    resolve({ data: mockCharacter });
                }, 10);
            });
        });
    });

    it('renders loading state initially', async () => {
        // Make sure selectedCharacter is null for this test
        mockSelectedCharacter = null;

        // Implement a delayed axios response
        axios.get.mockImplementation(() => {
            return new Promise(() => {
                // This promise will never resolve during the test
                setTimeout(() => { }, 1000);
            });
        });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        // Use a more flexible text matcher
        const loadingElement = screen.getByText((content) => {
            return content.toLowerCase().includes('loading');
        });

        expect(loadingElement).toBeInTheDocument();
    });

    it('displays character information after loading', async () => {
        // Set the mock character for this test
        mockSelectedCharacter = mockCharacter;

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        // Wait for character data to load
        await waitFor(() => {
            expect(screen.getByText(`${mockCharacter.name}'s Dashboard`)).toBeInTheDocument();
        });

        // Check character stats
        expect(screen.getByText('Level:')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Gold:')).toBeInTheDocument();
        expect(screen.getByText('500')).toBeInTheDocument();
    });

    it('refreshes data when refresh button is clicked', async () => {
        // Set the mock character for this test
        mockSelectedCharacter = mockCharacter;

        const user = userEvent.setup();

        // Get the mock functions we set up in the mock above
        const { refreshData } = useUser();

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        // Wait for dashboard to render
        await waitFor(() => {
            expect(screen.getByText(`${mockCharacter.name}'s Dashboard`)).toBeInTheDocument();
        });

        // Get refresh button and click it
        const refreshButton = screen.getByTitle('Refresh dashboard data');
        await user.click(refreshButton);

        // Check if refreshData was called
        expect(refreshData).toHaveBeenCalledTimes(1);
    });
});