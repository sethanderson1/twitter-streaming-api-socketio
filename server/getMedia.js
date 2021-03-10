// Get User objects by username, using bearer TOKEN authentication
// https://developer.twitter.com/en/docs/twitter-api/users/lookup/quick-start


const needle = require('needle');
const config = require('dotenv').config();

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const TOKEN = process.env.TWITTER_BEARER_TOKEN;

const endpointURL = "https://api.twitter.com/2/tweets"
// const endpointURL = "https://api.twitter.com/2/users/565807105"
// const endpointURL = "https://api.twitter.com/2/users/by?usernames="

// ?expansions=pinned_tweet_id&user.fields=created_at&tweet.fields=created_at
// ?expansions=pinned_tweet_id&user.fields=profile_image_url


// ?ids=1263145271946551300&expansions=attachments.media_keys&media.fields=duration_ms,height,media_key,preview_image_url,public_metrics,type,url,width

async function getMedia(id) {

    // These are the parameters for the API request
    // specify User names to fetch, and any additional fields that are required
    // by default, only the User ID, name and user name are returned
    const params = {
        ids: id, // Edit usernames to look up
        // "user.fields": "created_at,profile_image_url_https", // Edit optional query parameters here
        "media.fields": "duration_ms,height,media_key,preview_image_url,public_metrics,type,url,width", // Edit optional query parameters here

        "expansions": "attachments.media_keys"
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

module.exports = getMedia;