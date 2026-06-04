const WebSocket = require('ws');
const ws = new WebSocket('wss://marylee-brotherlike-rosily.ngrok-free.dev');
ws.on('open', () => {
    console.log('CONNECTED');
    ws.close();
});
ws.on('error', (err) => {
    console.error('ERROR', err);
});
ws.on('unexpected-response', (req, res) => {
    console.error('UNEXPECTED', res.statusCode);
});
