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

async function getUsers(id) {
    console.log('getUsers ran')

    // These are the parameters for the API request
    // specify User names to fetch, and any additional fields that are required
    // by default, only the User ID, name and user name are returned
    const params = {
        // usernames: "AmberSkyesMusic", // Edit usernames to look up
        // ids: "565807105", // Edit usernames to look up
        ids: id, // Edit usernames to look up
        // ids: "1286204495819444226", // Edit usernames to look up
        // "user.fields": "created_at,profile_image_url_https", // Edit optional query parameters here
        "user.fields": "created_at,profile_image_url", // Edit optional query parameters here
        // "expansions": "pinned_tweet_id"
    }


    // this is the HTTP header that adds bearer TOKEN authentication
    const res = await needle('get', endpointURL, params, {
        headers: {
            "User-Agent": "v2UserLookupJS",
            "authorization": `Bearer ${TOKEN}`
        }
    })

    if (res.body) {
        return res.body;
    } else {
        throw new Error('Unsuccessful request')
    }
}

; (async () => {
    try {
        // Make request
        const response = await getUsers();
        console.dir(response, {
            depth: null,
            colors: true
        });
        const profilePic = response.data[0].profile_image_url.replace('_normal', '');
        console.log('profilePic', profilePic)

    } catch (e) {
        // console.log(e);
        process.exit(-1);
    }
    process.exit();
})();

module.exports = getUsers;