const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videoId: {
        type: String,
        required: true,
        unique: true
    },
    thumbnailUrl: {
        type: String,
        required: true
    },
    publishedAt: {
        type: Date,
        required: true
    },
    channelTitle: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    },
    channelImage: {
        type: String,
        required: true
    },
    }
);

const Video = mongoose.model('Video', videoSchema);


module.exports = Video;

