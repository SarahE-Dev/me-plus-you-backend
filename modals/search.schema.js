const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
    query: {
        type: String,
        required: true
    },
    resultsArray: {
        type: Array
    },
    channelImages: {
        type: Array
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, {timestamps: true});

const Search = mongoose.model('Search', searchSchema);

module.exports = Search;