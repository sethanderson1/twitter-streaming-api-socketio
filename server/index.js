const http = require('http');
const path = require('path');
const socketio = require('socket.io')
const express = require('express');
const cors = require('cors')
const config = require('dotenv').config();
const TOKEN = process.env.TWITTER_BEARER_TOKEN;
const PORT = process.env.PORT || 8000;

const getUsers = require('./getUsers');
const getMedia = require('./getMedia');

let count = 0;
let cont = 0;

const app = express();

app.use(cors())

const server = http.createServer(app);
const needle = require('needle');
const io = socketio(server, {
    cors: {
        origin: "*",
        // origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

const tweetQueue = [];

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../', 'client', 'index.html'))
})

app.get('/index.css', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../', 'client', 'index.css'))
});

const rulesURL = `https://api.twitter.com/2/tweets/search/stream/rules`;
const streamURL = `https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=attachments.media_keys,author_id`;

const rules = [{ value: `lol` }];

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

function streamTweets(socket) {
    console.log('streamTweets ran')

    const stream = needle.get(streamURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            // "Access-Control-Allow-Origin": "http://localhost:3000"
            // "Access-Control-Allow-Origin": "*"
        }
    })

    stream.on('data', async (data) => {
        count = count + 1;
        console.log('count in stream.on', count)

        // console.log('data', data)
        // console.log('JSON.stringify(data', JSON.stringify(data));

        // const buf = Buffer.from(JSON.stringify(data));
        // const json = JSON.parse(buf.toString());

        const json = JSON.parse(data);
        console.log('json', json)
        // console.log('json.includes.users', json.includes.users)
        // queue the incoming tweets
        tweetQueue.push(json)
        console.log('tweetQueue length', tweetQueue.length)

        if (tweetQueue.length >= 15) {
            stream.pause();
            console.log('There will be no additional data for  seconds.');
            setTimeout(() => {
                console.log('Now data will start flowing again.');
                stream.resume();
            }, 10000);
        }



        // socket.emit('tweet', json)

    })

    const interval = setInterval(async function () {
        let nextTweet = tweetQueue.shift();
        if (nextTweet) {
            const payload = {}
            const url = `https://api.twitter.com/2/tweets?ids=1263145271946551300&expansions=attachments.media_keys&media.fields=duration_ms,height,media_key,preview_image_url,public_metrics,type,url,width`
            const text = nextTweet.data.text;
            console.log('text', text)
            // const tweetId = nextTweet.data.id;
            // fetch tweet object
            // const tweetObj = await getTweetObj(tweetId);
            // console.log('tweetObj', tweetObj)

            const media = nextTweet.includes?.media
            console.log('media_key:', media?.[0].media_key)
            // console.log('media', media)

            const media_keys = nextTweet.data.attachments?.media_keys
            console.log('media_keys', media_keys)

            // const tweetId = nextTweet.data.id;
            const userId = nextTweet.data.author_id;
            try {
                const profilePicUrl = await getProfilePicUrl(userId);
                // const mediaObj = await getMedia(tweetId);
                // console.log('mediaObj', mediaObj)
                // console.log('mediaObj?.data?.[0]?attachments', mediaObj?.data?.[0]?.attachments)
                // // console.log('mediaObj.includes?.media?.[0]', mediaObj?.includes?.media?.[0])
                // // console.log('mediaObj.includes?.media?.[0]?.url', mediaObj?.includes?.media?.[0]?.url)
                // const mediaUrl = mediaObj.includes?.media?.[0]?.url;
                // console.log('mediaUrl', mediaUrl)
                payload.text = text;
                payload.profilePicUrl = profilePicUrl;
                socket.emit("tweet", payload);
            } catch (error) {
                console.log('error', error)
            }

            // socket.emit("tweet", {  text });
        }
    }, 1000);
}

const getProfilePicUrl = async (userId) => {
    try {
        const response = await getUsers(userId, cont);
        const profilePicUrl = response.data[0].profile_image_url.replace('_normal', '');
        return profilePicUrl;
    } catch (error) {
        console.log('error', error)
    }
}

io.on('connection', async () => {
    console.log('client connected...')
    let currentRules
    try {
        currentRules = await getRules();
        // console.log('currentRules', currentRules)
        await deleteRules(currentRules);
        await setRules();
    } catch (error) {
        console.error('error', error);
        process.exit(1);
    }
    streamTweets(io);
})

server.listen(PORT, () => console.log(`listening on port: ${PORT}`))