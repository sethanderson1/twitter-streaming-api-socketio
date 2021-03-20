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

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;

