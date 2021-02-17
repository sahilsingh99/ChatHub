let expect = require('expect');

let {generateMessage, generateLocationMessage} = require('./message');

describe('Generate Message', () => {
    it('should generate correct message object', () => {
        let from = 'Sinu',
            text = 'this is Testing Message',
            message = generateMessage(from, text);
        
        expect(typeof message.createdAt).toBe('number');
        expect(message).toMatchObject({from, text}); 
    });
});

describe('Generate Location Message', () => {
    it('should generate correct Location message object', () => {
        let from = 'Sinu',
            lat = 180,
            lng = 120
            url = `https://www.google.com/maps?q=${lat}, ${lng}`,
            message = generateLocationMessage(from, lat, lng);
        
        expect(typeof message.createdAt).toBe('number');
        expect(message).toMatchObject({from, url}); 
    });
});
