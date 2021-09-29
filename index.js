require('dotenv').config();
const { exec } = require("child_process");

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express')
const app = express()
const port = 4444;

let isPlaying = false;

app.get('/play', async (req, res) => {
    const response = await exec(`atvremote --id ${process.env.APPLETVMAC} --airplay-credentials ${process.env.APPLETVTOKEN} play`);
    console.log(response);
    isPlaying = true;
    res.send({ status: 200, response })
})

app.get('/pause', async (req, res) => {
    const response = await exec(`atvremote --id ${process.env.APPLETVMAC} --airplay-credentials ${process.env.APPLETVTOKEN} pause`);
    console.log(response);
    isPlaying = false;
    res.send({ status: 200, response })
});

app.get('/playing', async (req, res) => {
    const response = await exec(`atvremote --id ${process.env.APPLETVMAC} --airplay-credentials ${process.env.APPLETVTOKEN} pause`);
    console.log(response);
    isPlaying = false;
    res.send({ status: 200, response })
})

app.get('/status', async (req, res) => {
    res.send(isPlaying)
})

app.listen(port, () => {
    console.log(process.env.APPLETVMAC);
    console.log(process.env.APPLETVTOKEN)
    console.log(`Apple TV 4K API http://localhost:${port}`)
})