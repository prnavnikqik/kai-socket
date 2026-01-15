const request = require('supertest');
const app = require('../services/server'); // Adjust the path as necessary

describe('API Endpoints', () => {
    let transcriptId;

    beforeAll(async () => {
        // Assuming there's a function to load initial data for testing
        await loadInitialData();
    });

    afterAll(async () => {
        // Clean up any test data if necessary
    });

    test('GET /transcripts - should return all transcripts', async () => {
        const response = await request(app).get('/transcripts');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /transcripts/:id - should return a specific transcript', async () => {
        const response = await request(app).get(`/transcripts/${transcriptId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id', transcriptId);
    });

    test('GET /search?q= - should return search results', async () => {
        const response = await request(app).get('/search?q=test');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // Additional tests can be added here
});

async function loadInitialData() {
    // Logic to load initial data into the database or mock data for testing
}