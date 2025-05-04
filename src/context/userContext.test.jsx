import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios'; // Import axios directly
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserProvider, useUser } from './userContext';

// Test component to consume the context
function TestComponent() {
    const { userId, selectedCharacter, refreshData } = useUser();

    return (
        <div>
            <div data-testid="user-id">{userId || 'no-user'}</div>
            <div data-testid="character-name">
                {selectedCharacter ? selectedCharacter.name : 'no-character'}
            </div>
            <button onClick={refreshData}>Refresh Data</button>
        </div>
    );
}

describe('UserContext', () => {
    beforeEach(() => {
        vi.resetAllMocks();

        // Mock JWT token with expiry far in the future
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJ1c2VyLWlkLTEyMyIsInJvbGUiOiJVc2VyIiwiZXhwIjoxOTk5OTk5OTk5fQ.signature';

        // Setup localStorage mock
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: (key) => key === 'authToken' ? mockToken : null,
                setItem: vi.fn(),
                removeItem: vi.fn()
            },
            writable: true
        });
    });

    it('loads character data when user is authenticated', async () => {
        // Mock axios responses - this is the correct way in Vitest
        axios.get.mockImplementation((url) => {
            if (url === 'http://localhost:5233/api/usercharacter') {
                return Promise.resolve({
                    data: [{
                        characterId: 1,
                        name: 'Hero',
                        class_: 'Warrior',
                        level: 5
                    }]
                });
            }

            if (url === 'http://localhost:5233/api/usercharacter/selected') {
                return Promise.resolve({
                    data: {
                        characterId: 1,
                        name: 'Hero',
                        class_: 'Warrior',
                        level: 5
                    }
                });
            }

            return Promise.reject(new Error('Not found'));
        });

        render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('character-name')).toHaveTextContent('Hero');
        });
    });

    it('refreshes data when refreshData is called', async () => {
        // First call (initial load)
        axios.get
            .mockImplementationOnce(() => { // For user characters
                return Promise.resolve({
                    data: [{
                        characterId: 1,
                        name: 'OldHero',
                        class_: 'Warrior',
                        level: 5
                    }]
                });
            })
            .mockImplementationOnce(() => { // For selected character
                return Promise.resolve({
                    data: {
                        characterId: 1,
                        name: 'OldHero',
                        class_: 'Warrior',
                        level: 5
                    }
                });
            })
            // Set up responses for the refresh call
            .mockImplementationOnce(() => { // For user characters (after refresh)
                return Promise.resolve({
                    data: [{
                        characterId: 1,
                        name: 'UpdatedHero',
                        class_: 'Warrior',
                        level: 6
                    }]
                });
            })
            .mockImplementationOnce(() => { // For selected character (after refresh)
                return Promise.resolve({
                    data: {
                        characterId: 1,
                        name: 'UpdatedHero',
                        class_: 'Warrior',
                        level: 6
                    }
                });
            });

        render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        // Wait for initial data load
        await waitFor(() => {
            expect(screen.getByTestId('character-name')).toHaveTextContent('OldHero');
        });

        // Click refresh button
        screen.getByText('Refresh Data').click();

        // Check if data was refreshed
        await waitFor(() => {
            expect(screen.getByTestId('character-name')).toHaveTextContent('UpdatedHero');
        });
    });
});