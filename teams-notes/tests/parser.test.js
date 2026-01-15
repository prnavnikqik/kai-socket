const fs = require('fs');
const path = require('path');
const { parseVTT } = require('../services/parser');

describe('VTT Parser', () => {
    const sampleVTTPath1 = path.join(__dirname, '../mock_data/sample1.vtt');
    const sampleVTTPath2 = path.join(__dirname, '../mock_data/sample2.vtt');

    test('should parse sample1.vtt correctly', (done) => {
        fs.readFile(sampleVTTPath1, 'utf8', (err, data) => {
            if (err) {
                done(err);
            }
            const result = parseVTT(data);
            expect(result).toEqual([
                { start: 0, end: 5, speaker: 'Speaker 1', text: 'Hello, this is a test.' },
                { start: 6, end: 10, speaker: 'Speaker 2', text: 'Hi there!' }
            ]);
            done();
        });
    });

    test('should parse sample2.vtt correctly', (done) => {
        fs.readFile(sampleVTTPath2, 'utf8', (err, data) => {
            if (err) {
                done(err);
            }
            const result = parseVTT(data);
            expect(result).toEqual([
                { start: 0, end: 3, speaker: 'Speaker A', text: 'Welcome to the meeting.' },
                { start: 4, end: 7, speaker: 'Speaker B', text: 'Thank you!' }
            ]);
            done();
        });
    });

    test('should handle empty VTT file', (done) => {
        const emptyVTT = '';
        const result = parseVTT(emptyVTT);
        expect(result).toEqual([]);
        done();
    });

    test('should handle malformed VTT file', (done) => {
        const malformedVTT = 'Not a valid VTT format';
        const result = parseVTT(malformedVTT);
        expect(result).toEqual([]);
        done();
    });
});