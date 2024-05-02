const mongoose = require('mongoose');



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
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    playlists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Playlist'
    }],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    history: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    searches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Search'
    }],
    watchLater: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    avatar: {
        type: String
    }

    
});

const User = mongoose.model('User', userSchema);

module.exports = User;