const User = require('../modals/user.schema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Playlist = require('../modals/playlist.schema');
const Comment = require('../modals/comment.schema');
const Video = require('../modals/video.schema');
const Search = require('../modals/search.schema');


exports.createUser = async (req, res) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            avatar: req.body.avatar
        });
        await user.save();
        const payload = {
            username: user.username,
            email: user.email,
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar
        };
        const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '24h' });
        res.status(200)
            .cookie('youtube-jwt', token)
            .json({ message: 'User created', token: token, user: payload })
    } catch (error) {
        if (error.code === 11000) { 
            const duplicateField = Object.keys(error.keyValue)[0];
            const errorMessage = `${duplicateField} already exists`;

            res.status(400).json({ error: errorMessage });
        } else {
            res.status(500).json({ error: 'Error creating user', details: error }); 
        }
    }
};

exports.loginUser = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid password' });
        }
        const payload = {
            username: user.username,
            email: user.email,
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar
        };
        const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '24h' });
        res.status(200)
            .cookie('youtube-jwt', token)
            .json({ message: 'User logged in', token: token, user: payload });
    }
    catch (error) {
        res.status(500).json({ error: 'Error logging in', details: error });
    }
}

exports.logoutUser = async (req, res) => {
    res.clearCookie('youtube-jwt').json({ message: 'User logged out' });
}

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete(req.body.username);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user', details: error });
    }
}

exports.addPlaylist = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const playlist = new Playlist({
            name: req.body.name,
            user: user._id
        });
        await playlist.save();
        user.playlists.push(playlist._id);
        await user.save();
        res.status(200).json({ message: 'Playlist created', playlist: playlist });
    }catch (error) {
        res.status(500).json({ error: 'Error creating playlist', details: error });
    }
}

exports.addComment = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const comment = new Comment({
            content: req.body.content,
            user: user._id,
            video: req.body.video,
            avatar: req.body.avatar
        });
        await comment.save();
        user.comments.push(comment._id);
        await user.save();
        res.status(200).json({ message: 'Comment created', comment: comment });
    }catch (error) {
        res.status(500).json({ error: 'Error creating comment', details: error });
    }
}

exports.addFavorite = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        let video = await Video.findOne({videoId: req.body.videoId});
        if(!video){
            video = new Video({
                videoId: req.body.videoId,
                title: req.body.title,
                description: req.body.description,
                thumbnailUrl: req.body.thumbnailUrl,
                publishedAt: req.body.publishedAt,
                channelTitle: req.body.channelTitle,
                channelId: req.body.channelId,
                channelImage: req.body.channelImage

            });
        }
        await video.save();
        user.favorites.push(video._id);
        await user.save();
        res.status(200).json({ message: 'Favorite added', video: video });
    }catch (error) {
        res.status(500).json({ error: 'Error adding favorite', details: error });
    }
}

exports.addHistory = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user})
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        let video = await Video.findOne({videoId: req.body.videoId});
        if(!video){
            const newVideo = new Video({
                videoId: req.body.videoId,
                title: req.body.title,
                description: req.body.description,
                thumbnailUrl: req.body.thumbnailUrl,
                publishedAt: req.body.publishedAt,
                channelTitle: req.body.channelTitle,
                channelId: req.body.channelId,
                channelImage: req.body.channelImage

            });
            await newVideo.save();
            user.history.push(newVideo._id);
            await user.save();
            res.status(200).json({ message: 'History added with new', video: newVideo });
            return
        }
        const foundVideo = user.history.indexOf(video._id);
        if(foundVideo !== -1){
            user.history.splice(foundVideo, 1);
            user.history.push(video._id)
            await user.save()
            res.status(200).json({ message: 'History updated with pull', video})
        }else{
            user.history.push(video._id)
            await user.save()
            res.json({message: 'history success', video})
        }

        
    }catch (error) {
        res.status(500).json({ error: 'Error adding history', details: error });
    }
}

exports.clearHistory=async(req, res)=>{
    try {
        const user = await User.findOne({_id: req.body.user})
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        user.history = [];
        await user.save();
        res.status(200).json({ message: 'History cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Error clearing history.', details: error });
    }
}

exports.removeFavorite = async (req, res) => {
    try {
        const user = await User.findOne({_id: req.body.user});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const video = await Video.findOne({videoId: req.body.videoId});
        if(!video){
            return res.status(404).json({ error: 'Video not found' });
        }
        const newFaves = user.favorites.filter(fave => fave.videoId !== req.body.videoId);
        user.favorites = newFaves;
        await user.save();
        res.status(200).json({ message: 'Favorite removed', video: video });
    }catch (error) {
        res.status(500).json({ error: 'Error removing favorite', details: error });
    }
}

exports.addVideoToPlaylist = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const playlist = await Playlist.findById({_id: req.body.playlist});
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        let video = await Video.findOne({videoId: req.body.videoId});
        if(!video){
            video = new Video({
                videoId: req.body.videoId,
                title: req.body.title,
                description: req.body.description,
                thumbnailUrl: req.body.thumbnailUrl,
                publishedAt: req.body.publishedAt,
                channelTitle: req.body.channelTitle,
                channelId: req.body.channelId,
                channelImage: req.body.channelImage

            });
        }
        await video.save();
        playlist.videos.push(video._id);
        await playlist.save();
        res.status(200).json({ message: 'Video added to playlist', video: video, playlist: playlist});
    }
    catch (error) {
        res.status(500).json({ error: 'Error adding video to playlist', details: error });
    }
}

exports.removeVideoFromPlaylist = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const playlist = await Playlist.findById({_id: req.body.playlist});
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        const video = await Video.findOne({videoId: req.body.videoId});
        if(!video){
            return res.status(404).json({ error: 'Video not found' });
        }
        const index = playlist.videos.indexOf(video._id);
        if (index > -1) {
            playlist.videos.splice(index, 1);
        }
        await playlist.save();
        res.status(200).json({ message: 'Video removed from playlist', video: video });
    }
    catch (error) {
        res.status(500).json({ error: 'Error removing video from playlist', details: error });
    }
}

exports.addSearchQuery = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const query = req.body.query;
        const search = new Search({
            query: query,
            resultsArray: req.body.resultsArray,
            channelImages: req.body.channelImages,
            user: user._id
        });
        await search.save();
        user.searches.push(search._id);
        await user.save();
        res.status(200).json({ message: 'Search query added', search: search });
    }
    catch (error) {
        res.status(500).json({ error: 'Error adding search query', details: error });
    }
}

exports.removeComment = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const comment = await Comment.findById({_id: req.body.comment});
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        const index = user.comments.indexOf(comment._id);
        if (index > -1) {
            user.comments.splice(index, 1);
        }
        await user.save();
        await Comment.findByIdAndDelete({_id: req.body.comment});
        res.status(200).json({ message: 'Comment removed', comment: comment });
    }catch (error) {
        res.status(500).json({ error: 'Error removing comment', details: error });
    }
}

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if(req.body.username){
            user.username = req.body.username;
        }
        if(req.body.email){
            user.email = req.body.email;
        }
        if(req.body.password){
            const saltRounds = 10;
            user.password = await bcrypt.hash(req.body.password, saltRounds);
        }
        if(req.body.firstName){
            user.firstName = req.body.firstName;
        }
        if(req.body.lastName){
            user.lastName = req.body.lastName;
        }
        await user.save();
        const payload = {
            username: user.username,
            email: user.email,
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar
        };
        // const userToSend = user.populate({path: 'playlists', populate: {path: 'videos'}}).populate({path: 'favorites'}).populate({path: 'comments'}).populate({path: 'searches'}).populate({path: 'watchLater'}).populate({path: 'history'});
        const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '24h' });
        res.status(200)
            .cookie('youtube-jwt', token)
            .json({ message: 'User updated', token: token, user: user});
    }catch (error) {
        res.status(500).json({ error: 'Error updating user', details: error });
    }
}

exports.editComment = async (req, res) => {
    try {
        const comment = await Comment.findById({_id: req.body.comment});
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        if(req.body.content){
            comment.content = req.body.content;
        }
        await comment.save();
        res.status(200).json({ message: 'Comment updated', comment: comment });
    }catch (error) {
        res.status(500).json({ error: 'Error updating comment', details: error });
    }
}

exports.deleteComment = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const comment = await Comment.findByIdAndDelete({_id: req.body.comment});
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        const index = user.comments.indexOf(comment._id);
        if (index > -1) {
            user.comments.splice(index, 1);
        }
        await user.save();
        res.status(200).json({ message: 'Comment deleted', comment: comment });
    }catch (error) {
        res.status(500).json({ error: 'Error deleting comment', details: error });
    }
}

exports.getLastSearchQuery = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const search = user.searches[user.searches.length - 1];
        res.status(200).json({ message: 'Last search query', search: search });
    }catch (error) {
        res.status(500).json({ error: 'Error getting last search query', details: error });
    }

}

exports.getAllUserPlaylists = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user}).populate({path: 'playlists', populate: {path: 'videos'}});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User playlists', playlists: user.playlists });
    }catch (error) {
        res.status(500).json({ error: 'Error getting user playlists', details: error });
    }
}

exports.getAllUserFavorites = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user}).populate({path: 'favorites'});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User favorites', favorites: user.favorites });
    }   catch (error) {
        res.status(500).json({ error: 'Error getting user favorites', details: error });
    }
}

exports.getAllUserComments = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user}).populate({path: 'comments'});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User comments', comments: user.comments });
    }catch (error) {
        res.status(500).json({ error: 'Error getting user comments', details: error });
    }
}

exports.getEveryUserCommentForVideo = async (req, res) => {
    try {
        const comments = await Comment.find({video: req.params.video}).populate('user');
        res.status(200).json({ message: 'Comments for video', comments: comments });
    }catch (error) {
        res.status(500).json({ error: 'Error getting comments for video', details: error });
    }
}

exports.populateAllAUserInfo = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user}).populate({path: 'playlists', populate: {path: 'videos'}}).populate({path: 'favorites'}).populate({path: 'comments'}).populate({path: 'searches'}).populate({path: 'watchLater'}).populate({path: 'history'});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User info', user: user });
    }
    catch (error) {
        res.status(500).json({ error: 'Error getting user info', details: error });
    }
}

exports.addWatchLater = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        let video = await Video.findOne({videoId: req.body.videoId});
        if(!video){
            video = new Video({
                videoId: req.body.videoId,
                title: req.body.title,
                description: req.body.description,
                thumbnailUrl: req.body.thumbnailUrl,
                publishedAt: req.body.publishedAt,
                channelTitle: req.body.channelTitle,
                channelId: req.body.channelId,
                channelImage: req.body.channelImage

            });
        }
        await video.save();
        user.watchLater.push(video._id);
        await user.save();
        res.status(200).json({ message: 'Video added to watch later', video: video });
    }catch (error) {    
        res.status(500).json({ error: 'Error adding video to watch later', details: error });
    }
}

exports.removeWatchLater = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const video = await Video.findOne({videoId: req.body.videoId});
        if(!video){
            return res.status(404).json({ error: 'Video not found' });
        }
        const index = user.watchLater.indexOf(video._id);
        if (index > -1) {
            user.watchLater.splice(index, 1);
        }
        await user.save();
        res.status(200).json({ message: 'Video removed from watch later', video: video });
    }catch (error) {
        res.status(500).json({ error: 'Error removing video from watch later', details: error });
    }
}

exports.addToHistory = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        let video = await Video.findOne({videoId: req.body.videoId});
        if(!video){
            video = new Video({
                videoId: req.body.videoId,
                title: req.body.title,
                description: req.body.description,
                thumbnailUrl: req.body.thumbnailUrl,
                publishedAt: req.body.publishedAt,
                channelTitle: req.body.channelTitle,
                channelId: req.body.channelId,
                channelImage: req.body.channelImage

            });
        }
        await video.save();
        if(user.history.includes(video._id)){
            user.history = user.history.filter(elem=>elem._id !== video._id);
        }
        user.history.push(video._id);
        
        await user.save();
        res.status(200).json({ message: 'Video added to history', video: video });
    }catch (error) {
        res.status(500).json({ error: 'Error adding video to history', details: error });
    }
}

exports.removeVideoFromHistory = async (req, res) => {
    try {
        const user = await User.findById({_id: req.body.user});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const video = await Video.findOne({videoId: req.body.videoId});
        if(!video){
            return res.status(404).json({ error: 'Video not found' });
        }
        const index = user.history.indexOf(video._id);
        if (index > -1) {
            user.history.splice(index, 1);
        }
        await user.save();
        res.status(200).json({ message: 'Video removed from history', video: video });
    }catch (error) {
        res.status(500).json({ error: 'Error removing video from history', details: error });
    }
}

exports.getAllUserCommentsForVideo = async (req, res) => {
    try {
        const comments = await Comment.find({video: req.params.video}).populate('user');
        res.status(200).json({ message: 'Comments for video', comments: comments });
    }catch (error) {
        res.status(500).json({ error: 'Error getting comments for video', details: error });
    }
}

exports.removePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findByIdAndDelete({_id: req.body.playlist});
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        const user = await User.findOne({_id: req.body.user});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const index = user.playlists.indexOf(playlist._id);
        if (index > -1) {
            user.playlists.splice(index, 1);
        }
        await user.save();
        res.status(200).json({ message: 'Playlist deleted', playlist: playlist, user: user });
    }catch (error) {
        res.status(500).json({ error: 'Error deleting playlist', details: error });
    }
}