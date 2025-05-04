import { http, HttpResponse } from 'msw';

export const handlers = [
    // Auth endpoints
    http.post('http://localhost:5233/api/auth/login', () => {
        return HttpResponse.json({
            token: 'fake-token',
            userId: 'user-123'
        });
    }),

    http.post('http://localhost:5233/api/auth/refresh', () => {
        return HttpResponse.json({
            token: 'refreshed-token'
        });
    }),

    // Character endpoints
    http.get('http://localhost:5233/api/usercharacter', () => {
        return HttpResponse.json([
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
        ]);
    }),

    http.get('http://localhost:5233/api/usercharacter/selected', () => {
        return HttpResponse.json({
            characterId: 1,
            userCharacterId: 101,
            name: 'Arthas',
            class_: 'Warrior',
            level: 3,
            experience: 450,
            gold: 200
        });
    }),

    http.post('http://localhost:5233/api/usercharacter/select', () => {
        return new HttpResponse(null, { status: 200 });
    }),
];

export default handlers;