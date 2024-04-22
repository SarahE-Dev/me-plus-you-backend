const mongoose = require('mongoose');
const { videoSchema } = require('./video.schema');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    favorites: [videoSchema]
    ,
    playlists: [{
        name: {
            type: String,
            required: true
        },
        videos: [videoSchema]
    }]
    
});

const User = mongoose.model('User', userSchema);

module.exports = User;