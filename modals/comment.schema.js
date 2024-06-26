const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    video: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    }
}, {timestamps: true});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;