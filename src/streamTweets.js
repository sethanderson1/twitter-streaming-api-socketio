const needle = require('needle');
const TOKEN = process.env.TWITTER_BEARER_TOKEN;
let count = 0;
let date = new Date()
console.log('date', date)

const tweetQueue = [];
const streamURL = `https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=attachments.media_keys,author_id`;


function streamTweets(socket) {
    console.log('streamTweets ran')

    const stream = needle.get(streamURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            // "Access-Control-Allow-Origin": "http://localhost:3000"
            // "Access-Control-Allow-Origin": "*"
        }
    })

    // TODO: see if re adding the slow down functions breaks stream again

    stream.on('data', async (data) => {
        count = count + 1;
        console.log('count in stream.on', count)

        // console.log('data', data)
        // console.log('JSON.stringify(data', JSON.stringify(data));

        // const buf = Buffer.from(JSON.stringify(data));
        // const json = JSON.parse(buf.toString());

        console.log('data', data[0])
        console.log('data.toString()', data.toString().length)
        let json;
        if (data.toString().length > 2 && data[0] !== undefined) {
            console.log('data', data)
            json = JSON.parse(data);
        }
        console.log('json', json)
        // console.log('json.includes.users', json.includes.users)
        // queue the incoming tweets
        tweetQueue.push(json)
        console.log('tweetQueue length', tweetQueue.length)

        // if (tweetQueue.length >= 15) {
        //     stream.pause();
        //     console.log('There will be no additional data for  seconds.');
        //     setTimeout(() => {
        //         console.log('Now data will start flowing again.');
        //         stream.resume();
        //     }, 10000);
        // }



        // socket.emit('tweet', json)

    })

    const newTweetInterval = 0;

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
                // const mediaObj = await getMedia(tweetId);
                // console.log('mediaObj', mediaObj)
                // console.log('mediaObj?.data?.[0]?attachments', mediaObj?.data?.[0]?.attachments)
                // // console.log('mediaObj.includes?.media?.[0]', mediaObj?.includes?.media?.[0])
                // // console.log('mediaObj.includes?.media?.[0]?.url', mediaObj?.includes?.media?.[0]?.url)
                // const mediaUrl = mediaObj.includes?.media?.[0]?.url;
                // console.log('mediaUrl', mediaUrl)
                payload.text = text;
                // const profilePicUrl = await getProfilePicUrl(userId);
                // payload.profilePicUrl = profilePicUrl;
                socket.emit("tweet", payload);
            } catch (error) {
                console.log('error', error)
            }

            // socket.emit("tweet", {  text });
        }
    }, newTweetInterval);
}

module.exports = streamTweets;