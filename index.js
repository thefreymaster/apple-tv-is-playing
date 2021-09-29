require('dotenv').config();
const { exec } = require("child_process");
var LocalStorage = require('node-localstorage').LocalStorage;
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
localStorage = new LocalStorage('./localstorage');

const express = require('express')
const app = express()
const port = 4444;

let isPlaying = false;

app.get('/api', async (req, res) => {
    res.send({
        "/api": {
            "/play": "play media",
            "/pause": "pause media",
            "/playing": "get playing media status"
        }
    })
})

app.get('/api/play', async (req, res) => {
    const { stdout } = await exec(`atvscript --id ${process.env.APPLETVMAC} --airplay-credentials ${process.env.APPLETVTOKEN} play`);
    stdout.on('data', function (data) {
        console.log(process.stdout.write(data));
        localStorage.setItem('isPlaying', true);
        res.send({ status: 200, data: JSON.parse(data) })
    });
})

app.get('/api/pause', async (req, res) => {
    const { stdout } = await exec(`atvscript --id ${process.env.APPLETVMAC} --airplay-credentials ${process.env.APPLETVTOKEN} pause`);
    stdout.on('data', function (data) {
        console.log(process.stdout.write(data));
        localStorage.setItem('isPlaying', false);
        res.send({ status: 200, data: JSON.parse(data) })
    });
});

app.get('/api/playing', async (req, res) => {
    const { stdout } = await exec(`atvscript --id ${process.env.APPLETVMAC} --airplay-credentials ${process.env.APPLETVTOKEN} playing`);

    stdout.on('data', function (data) {
        process.stdout.write(data)
        console.log(JSON.parse(data));
        res.send({ status: 200, data: JSON.parse(data) })
    });
})

app.get('/api/status', async (req, res) => {
    res.send(localStorage.getItem('isPlaying'))
})

const updates = async () => {
    const { stdout } = await exec(`atvscript --id ${process.env.APPLETVMAC} --airplay-credentials ${process.env.APPLETVTOKEN} push_updates`);

    stdout.on('data', function (data) {
        const parsedData = JSON.parse(data);
        if (parsedData.device_state === 'paused') {
            localStorage.setItem('isPlaying', false);
        }
        if (parsedData.device_state === 'playing') {
            localStorage.setItem('isPlaying', true);
        }
        console.log(parsedData);
        process.stdout.write(data)
    });
    stdout.on('resume', function (data) {
        process.stdout.write(data)
        console.log(JSON.parse(data));
    });
}

app.listen(port, () => {
    console.log(process.env.APPLETVMAC);
    console.log(process.env.APPLETVTOKEN)
    console.log(`Apple TV 4K API http://localhost:${port}`);
    localStorage.setItem('isPlaying', false);
    updates();
})