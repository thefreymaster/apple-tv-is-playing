require('dotenv').config();
const { exec } = require("child_process");
const LocalStorage = require('node-localstorage').LocalStorage;
const path = require('path');
const WebSocket = require('ws');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
localStorage = new LocalStorage('./localstorage');

const express = require('express')
const app = express()
const port = 4444;
const ws = new WebSocket('ws://192.168.124.57:9800/');

ws.on('open', function open() {
    console.log("Homebridge connection open.")
});

app.get('/api', async (req, res) => {
    res.send({
        "/api": {
            "/play": "play media",
            "/pause": "pause media",
            "/playing": "get playing media status",
            "/status": "get status of playing"
        }
    })
})

app.get('/api/play', async (req, res) => {
    const { stdout } = await exec(`atvscript --id ${process.env.APPLETVMAC} --airplay-credentials ${process.env.APPLETVTOKEN} play`);
    stdout.on('data', function (data) {
        console.log(process.stdout.write(data));
        localStorage.setItem('isPlaying', true);
        res.send({ data: JSON.parse(data) })
    });
})

app.get('/api/pause', async (req, res) => {
    const { stdout } = await exec(`atvscript --id ${process.env.APPLETVMAC} --airplay-credentials ${process.env.APPLETVTOKEN} pause`);
    stdout.on('data', function (data) {
        console.log(process.stdout.write(data));
        localStorage.setItem('isPlaying', false);
        res.send({ data: JSON.parse(data) })
    });
});

app.get('/api/playing', async (req, res) => {
    const { stdout } = await exec(`atvscript --id ${process.env.APPLETVMAC} --airplay-credentials ${process.env.APPLETVTOKEN} playing`);

    stdout.on('data', function (data) {
        process.stdout.write(data)
        console.log(JSON.parse(data));
        res.send({ data: JSON.parse(data) })
    });
})

app.get('/api/status', async (req, res) => {
    res.send(localStorage.getItem('isPlaying') === 'true' ? 1 : 0);
})

const updates = async () => {
    const { stdout } = await exec(`atvscript --id ${process.env.APPLETVMAC} --airplay-credentials ${process.env.APPLETVTOKEN} push_updates`);

    stdout.on('data', function (data) {
        const parsedData = JSON.parse(data);
        if (parsedData.device_state === 'paused') {
            localStorage.setItem('isPlaying', false);
            ws.send(JSON.stringify({ "topic": "set", "payload": { "name": "isAppleTVPlaying", "characteristic": "On", "value": false } }));
        }
        if (parsedData.device_state === 'playing') {
            localStorage.setItem('isPlaying', true);
            ws.send(JSON.stringify({ "topic": "set", "payload": { "name": "isAppleTVPlaying", "characteristic": "On", "value": true } }));
        }
        if(parsedData.power_state === 'on'){
            ws.send(JSON.stringify({ "topic": "set", "payload": { "name": "isAppleTVOn", "characteristic": "On", "value": true } }));
        }
        if(parsedData.power_state === 'off'){
            ws.send(JSON.stringify({ "topic": "set", "payload": { "name": "isAppleTVOn", "characteristic": "On", "value": false } }));
        }
        console.log(parsedData);
        process.stdout.write(data)
    });
}

app.listen(port, () => {
    console.log(process.env.APPLETVMAC);
    console.log(process.env.APPLETVTOKEN)
    console.log(`Apple TV 4K API http://localhost:${port}`);
    localStorage.setItem('isPlaying', false);
    updates();
})