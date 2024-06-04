const express = require('express');


const router = express.Router();
const {validateUserData} = require('../utils/middleware')


const {createUser, loginUser, deleteUser, logoutUser, addPlaylist, addFavorite, addHistory, addComment, removeFavorite, addVideoToPlaylist, addSearchQuery, removeVideoFromPlaylist, getAllUserPlaylists, getAllUserFavorites, getAllUserComments, populateAllAUserInfo, addToHistory, addWatchLater, getAllUserCommentsForVideo, removePlaylist, deleteComment, editComment, updateUser, clearHistory} = require('../controllers/user.controller');

router.post('/signup', validateUserData, createUser);

router.post('/login', loginUser);   

router.delete('/delete', deleteUser);

router.get('/logout', logoutUser);

router.post('/add-playlist', addPlaylist);

router.post('/add-favorite', addFavorite);

router.post('/add-history', addHistory);

router.post('/add-comment', addComment);

router.post('/remove-favorite', removeFavorite);

router.post('/add-video-to-playlist', addVideoToPlaylist);

router.post('/add-search', addSearchQuery);

router.post('/remove-video-from-playlist', removeVideoFromPlaylist);

router.get('/get-user-playlists', getAllUserPlaylists)

router.get('/get-user-favorites', getAllUserFavorites)

router.get('/get-user-comments', getAllUserComments)

router.post('/get-all-user-info', populateAllAUserInfo)

router.post('/add-to-history', addHistory)

router.post('/add-to-watch-later', addWatchLater)

router.get('/get-video-comments/:video', getAllUserCommentsForVideo)

router.post('/delete-playlist', removePlaylist)

router.post('/delete-comment', deleteComment)

router.post('/edit-comment', editComment)

router.post('/update-user', updateUser)

router.post('/clear-history', clearHistory)

router.get('/', (req, res) => {
    res.send('Hello from user router');
});

module.exports = router;