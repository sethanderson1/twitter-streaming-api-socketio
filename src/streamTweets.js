const needle = require('needle');
const mongoose = require('mongoose');
const Tweet = require('../models/tweet');
const TOKEN = process.env.TWITTER_BEARER_TOKEN;
const getUsers = require('./getUsers')
const analyzeText = require('../utils/analyzeText')
const { terms } = require('../utils/termList')
let count = 0;
let tweetCount = 0;
let tweetsPerMin = 0;
const tweetQueue = [];
const streamURL = `https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=attachments.media_keys,author_id`;



function streamTweets(socket) {
    console.log('streamTweets ran')

    const stream = needle.get(streamURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
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

        // console.log('data', data[0])
        // console.log('data.toString()', data.toString().length)
        let json;
        // console.log('data', data)
        if (data.toString().length > 2 && data[0] !== undefined) {
            console.log('data', data)
            json = JSON.parse(data);
            console.log('json', json)
            // filter out retweets
            if (!json.data.text.startsWith('RT')) {
                const hasTermObj = analyzeText(json.data.text)
                json.data.hasTermObj = hasTermObj;
                tweetQueue.push(json)
                tweetCount++
                console.log('tweetCount', tweetCount)



                const tweet = new Tweet({
                    text: json.data.text,
                    author_id: json.data.author_id,
                    id: json.data.id,
                })

                tweet.save()
                    .then((result) => {
                        console.log('result', result)
                        // res.send(result)
                    })
                    .catch((err) => {
                        console.log('err', err)
                    })



                // console.log('tweetQueue', tweetQueue)
            }
        }
        // console.log('json', json)

        // console.log('json', json)
        // queue the incoming tweets

        // console.log('tweetQueue length', tweetQueue.length)

        if (tweetQueue.length >= 20) {
            stream.pause();
            console.log('There will be no additional data for  seconds.');
            setTimeout(() => {
                console.log('Now data will start flowing again.');
                stream.resume();
            }, 5000);
        }

    })

    // setInterval(() => {
    //     tweetsPerMin = tweetCount * 15;
    //     console.log('tweetsPerMin', tweetsPerMin)
    //     tweetCount = 0
    // }, 4000)


    const newTweetInterval = 20;
    let cont = 0;

    const interval = setInterval(async function () {
        let nextTweet = tweetQueue.shift();
        if (nextTweet) {
            // console.log('nextTweet', nextTweet)
            // console.log('nextTweet', nextTweet.includes.users[0])
            const payload = {}
            // const url = `https://api.twitter.com/2/tweets?ids=1263145271946551300&expansions=attachments.media_keys&media.fields=duration_ms,height,media_key,preview_image_url,public_metrics,type,url,width`
            const text = nextTweet?.data?.text;
            // console.log('text', text)
            // const tweetId = nextTweet.data.id;
            // fetch tweet object
            // const tweetObj = await getTweetObj(tweetId);
            // console.log('tweetObj', tweetObj)

            // const media = nextTweet.includes?.media
            // console.log('media_key:', media?.[0].media_key)
            // // console.log('media', media)

            // const media_keys = nextTweet.data.attachments?.media_keys
            // console.log('media_keys', media_keys)

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

                const getProfilePicUrl = async (userId) => {
                    console.log('userId', userId)
                    try {
                        const response = await getUsers(userId, cont);
                        const profilePicUrl = response?.data?.[0]?.profile_image_url.replace('_normal', '');
                        return profilePicUrl;
                    } catch (error) {
                        console.log('error', error)
                    }
                }


                const profilePicUrl = await getProfilePicUrl(userId);
                payload.profilePicUrl = profilePicUrl;
                // payload.tweetsPerMin = tweetsPerMin;

                const hasTermObj = nextTweet.data.hasTermObj;
                payload.hasTermObj = hasTermObj;

                payload.terms = terms;

                socket.emit("tweet", payload);
            } catch (error) {
                console.log('error', error)
            }

            // socket.emit("tweet", {  text });
        }
    }, newTweetInterval);
}

module.exports = streamTweets;