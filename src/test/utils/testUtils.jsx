import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { UserProvider } from '../../context/userContext';

// Custom render that includes your app's providers
export function renderWithProviders(
    ui,
    {
        initialRoute = '/',
        // You can add more provider initial states here
        ...renderOptions
    } = {}
) {
    function Wrapper({ children }) {
        return (
            <MemoryRouter initialEntries={[initialRoute]}>
                <UserProvider>
                    {children}
                </UserProvider>
            </MemoryRouter>
        );
    }

    return { ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Create mock API responses
export const mockApiResponses = {
    characters: [
        {
            characterId: 1,
            userCharacterId: 101,
            name: 'Arthas',
            class_: 'Warrior',
            level: 3,
            experience: 450,
            gold: 200,
            isSelected: true
        },
        {
            characterId: 2,
            userCharacterId: 102,
            name: 'Ezra',
            class_: 'Mage',
            level: 2,
            experience: 200,
            gold: 150,
            isSelected: false
        }
    ],

    selectedCharacter: {
        characterId: 1,
        userCharacterId: 101,
        name: 'Arthas',
        class_: 'Warrior',
        level: 3,
        experience: 450,
        gold: 200
    },

    // Add more mock responses as needed
};

// Helper to create mock tokens
export function createMockToken(userId = 'user123', isAdmin = false, expiryInSeconds = 3600) {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        nameid: userId,
        role: isAdmin ? 'Admin' : 'User',
        exp: now + expiryInSeconds
    };

    // Create a fake encoded payload (not real JWT encoding, just for testing)
    const encodedPayload = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encodedPayload}.SIGNATURE`;
}