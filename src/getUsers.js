// Get User objects by username, using bearer TOKEN authentication
// https://developer.twitter.com/en/docs/twitter-api/users/lookup/quick-start


const needle = require('needle');
const config = require('dotenv').config();

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const TOKEN = process.env.TWITTER_BEARER_TOKEN;

const endpointURL = "https://api.twitter.com/2/users"
// const endpointURL = "https://api.twitter.com/2/users/565807105"
// const endpointURL = "https://api.twitter.com/2/users/by?usernames="

// ?expansions=pinned_tweet_id&user.fields=created_at&tweet.fields=created_at
// ?expansions=pinned_tweet_id&user.fields=profile_image_url

async function getUsers(id, cont) {
    // console.log('getUsers ran')
    // console.log('cont in getUsers', cont)

    // These are the parameters for the API request
    // specify User names to fetch, and any additional fields that are required
    // by default, only the User ID, name and user name are returned
    const params = {
        ids: id, // Edit usernames to look up
        // "user.fields": "created_at,profile_image_url_https", // Edit optional query parameters here
        "user.fields": "created_at,profile_image_url", // Edit optional query parameters here
        // "expansions": "pinned_tweet_id"
    }
    try {
        // this is the HTTP header that adds bearer TOKEN authentication
        const res = await needle('get', endpointURL, params, {
            headers: {
                "User-Agent": "v2UserLookupJS",
                "authorization": `Bearer ${TOKEN}`
            }
        })

        if (res.body) {
            // console.log('res', res)
            // console.log('res.body', res.body)
            // console.log(`res.body.data[0] for ${cont}`, res.body.data[0])
            return res.body;
        } else {
            throw new Error('Unsuccessful request')
        }

    } catch (error) {

    }
}

module.exports = getUsers;