const User = require('../modals/user.schema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.createUser = async (req, res) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });
        await user.save();
        const payload = {
            username: user.username,
            email: user.email,
            id: user._id
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
        let user;
        if(req.body.username){
            user = await User.findOne({ username: req.body.username});
        }
        if(req.body.email){
            user = await User.findOne({ email: req.body.email});
        }
        
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
            id: user._id
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


