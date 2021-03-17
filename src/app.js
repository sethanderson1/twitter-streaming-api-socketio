const http = require('http');
const path = require('path');
const socketio = require('socket.io')
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors')
const config = require('dotenv').config();
const TOKEN = process.env.TWITTER_BEARER_TOKEN;
const Tweet = require('../models/tweet');

const app = express();

app.use(cors());

// app.get('/add-tweet', (req, res) => {
//     const tweet = new Tweet({
//         text: '@FortTory He still has his watch on TEST TEST TEST lmao',
//         author_id: '1218283544797163523',
//         id: '1371681086766518281',
//     })

//     tweet.save()
//         .then((result) => {
//             console.log('result', result)
//             res.send(result)
//         })
//         .catch((err) => {
//             console.log('err', err)
//         })
// })

// app.get('/getbyid', (req, res) => {
//     Tweet.
// })

const server = http.createServer(app);
const needle = require('needle');
const streamTweets = require('./streamTweets');
const { termList, terms } = require('../utils/termList');

const io = socketio(server, {
    cors: {
        origin: "*",
        // origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})



const rulesURL = `https://api.twitter.com/2/tweets/search/stream/rules`;



const searchTerm = termList;
console.log('termList', termList)

const rules = [{ value: searchTerm }];

// get stream rules
async function getRules() {
    const response = await needle('get', rulesURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })

    // console.log('getRules response.body', response.body)
    return response.body
}

// set stream rules
async function setRules() {
    const data = {
        add: rules
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
        }
    })
    // console.log('setRules response.body', response.body)
    return response.body
}

// delete stream rules
async function deleteRules(rules) {
    // console.log('deleteRules ran')
    if (!Array.isArray(rules.data)) {
        return null;
    }

    const ids = rules.data.map(el => el = el.id)
    // console.log('ids', ids)

    const data = {
        delete: {
            ids: ids
        }
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
        }
    })

    // console.log('deleteRules response.body', response.body)
    return response.body
}

io.on('connection', async () => {
    console.log('client connected...')
    let currentRules;
    try {
        currentRules = await getRules();
        await deleteRules(currentRules);
        const dummy = await setRules();
    } catch (error) {
        console.error('error', error);
        process.exit(1);
    }
    streamTweets(io);
})

module.exports = server;