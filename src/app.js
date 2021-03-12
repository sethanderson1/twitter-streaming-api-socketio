const http = require('http');
const path = require('path');
const socketio = require('socket.io')
const express = require('express');
const cors = require('cors')
const config = require('dotenv').config();
const TOKEN = process.env.TWITTER_BEARER_TOKEN;
let cont = 0;

const app = express();

app.use(cors());

const server = http.createServer(app);
const needle = require('needle');
const streamTweets = require('./streamTweets');

const io = socketio(server, {
    cors: {
        origin: "*",
        // origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

// app.get('/', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../', 'client', 'index.html'))
// })

// app.get('/index.css', function (req, res) {
//     res.sendFile(path.resolve(__dirname, '../', 'client', 'index.css'))
// });

const rulesURL = `https://api.twitter.com/2/tweets/search/stream/rules`;

const searchTerm = `lol`;

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

// const getProfilePicUrl = async (userId) => {
//     try {
//         const response = await getUsers(userId, cont);
//         const profilePicUrl = response?.data?.[0]?.profile_image_url.replace('_normal', '');
//         return profilePicUrl;
//     } catch (error) {
//         console.log('error', error)
//     }
// }

io.on('connection', async () => {
    console.log('client connected...')
    let currentRules;
    try {
        currentRules = await getRules();
        await deleteRules(currentRules);
        await setRules();
    } catch (error) {
        console.error('error', error);
        process.exit(1);
    }
    streamTweets(io);
})

module.exports = server;