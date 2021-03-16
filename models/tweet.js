const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// TODO: add a created_at property  

const tweetSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    author_id: {
        type: String,
        required: true
    },
    text: {
        type: String, 
        required: true
    }
}, { timestamps: true });

// TODO: make sure Tweet is the right thing to name below in model()
// possibly should be called 'tweet' lowercase... EDIT: apparently doesnt matter
const Tweet = mongoose.model('Tweet',tweetSchema);

module.exports = Tweet;

