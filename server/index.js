const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const needle = require('needle');
const config = require('dotenv').config();
const TOKEN = process.env.TWITTER_BEARER_TOKEN;
const PORT = process.env.PORT || 3000;

// const getUsers = require('./getUsers');

const app = express();

const server = http.createServer(app);
const io = socketio(server);

// app.get('/', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../', 'client', 'index.html'))
// })

const rulesURL = `https://api.twitter.com/2/tweets/search/stream/rules`;
const streamURL = `https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id`;

const rules = [{ value: `frog` }];

// get stream rules
async function getRules() {
    const response = await needle('get', rulesURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })

    console.log('getRules response.body', response.body)
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
    console.log('setRules response.body', response.body)
    return response.body
}

// delete stream rules
async function deleteRules(rules) {
    console.log('deleteRules ran')
    if (!Array.isArray(rules.data)) {
        return null;
    }

    const ids = rules.data.map(el => el = el.id)
    console.log('ids', ids)

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

    console.log('deleteRules response.body', response.body)
    return response.body
}

function streamTweets(socket) {
    console.log('streamTweets ran')
    const stream = needle.get(streamURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })

    stream.on('data', (data) => {
        try {
            const json = JSON.parse(data);
            console.log('json', json)

            // TODO: await a fetch to get user object with the profile
            // pic and then send it to client 


            // socket.emit('tweet', json)
        } catch (error) {

        }
    })
}

// io.on('connection', async () => {
//     // console.log('client connected...')

//     let currentRules
//     try {
//         currentRules = await getRules();
//         console.log('currentRules', currentRules)
//         await deleteRules(currentRules);
//         await setRules();
//     } catch (error) {
//         console.error('error', error);
//         process.exit(1);
//     }

//     streamTweets(io);
// })





; (async () => {
    let currentRules
    try {
        currentRules = await getRules();
        console.log('currentRules', currentRules)
        await deleteRules(currentRules);
        await setRules();
    } catch (error) {
        console.error('error', error);
        process.exit(1);
    }
    streamTweets(io);
})();



server.listen(PORT, () => console.log(`listening on port: ${PORT}`))








































































