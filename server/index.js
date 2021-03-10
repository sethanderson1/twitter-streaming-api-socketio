const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const needle = require('needle');
const config = require('dotenv').config();
const TOKEN = process.env.TWITTER_BEARER_TOKEN;
const PORT = process.env.PORT || 3000;

const getUsers = require('./getUsers');

let count = 0;
let cnt = 0;
let cont = 0;

const app = express();

const server = http.createServer(app);
const io = socketio(server);

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

async function fetchProfilePic(id) {
    cnt = cnt + 1;
    console.log('cnt in fetchProfilePic', cnt)
    try {
        console.log('fetchProfilePic ran')
        cont = cont + 1;
        const response = await getUsers(id, cont);

        const profilePicUrl = response.data[0].profile_image_url.replace('_normal', '');
        // console.log('profilePicUrl from getUsers', profilePicUrl)

        return profilePicUrl;
    } catch (e) {
        console.log(e);
        // process.exit(-1);
    }
    // process.exit();
}

function streamTweets(socket) {
    console.log('streamTweets ran')

    const stream = needle.get(streamURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
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
            const text = nextTweet.data.text;
            console.log('text', text)
            // const tweetId = nextTweet.data.id;
            // fetch tweet object
            // const tweetObj = await getTweetObj(tweetId);
            // console.log('tweetObj', tweetObj)

            const media = nextTweet.includes?.media
            console.log('media', media)

            const media_keys = nextTweet.data.attachments?.media_keys
            console.log('media_keys', media_keys)

            // Await a fetch to get user object with the profile
            // pic and then send it to client 
            const userId = nextTweet.data.author_id;
            const profilePicUrl = await getProfilePicUrl(userId);
            socket.emit("tweet", { profilePicUrl, text });

            // socket.emit("tweet", {  text });
        }
    }, 1000);
}

const getTweetObj = async (tweetId) => {

}

const getProfilePicUrl = async (userId) => {
    const profilePicUrl = await fetchProfilePic(userId);
    console.log('profilePicUrl', profilePicUrl)
    return profilePicUrl;
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