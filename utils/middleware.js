const validator = require('validator');

exports.validateUserData = (req, res, next) => {
    const { username, email, password, firstName, lastName } = req.body;

    const errors = {}

    if (!username) {
        errors.username = 'Username is required';
    }else if(!validator.isAlphanumeric(username)){
        errors.username = 'Username must be alphanumeric';

    }else if(username.length < 6){
        errors.username = 'Username is too short';
    }else if(username.length > 20){
        errors.username = 'Username is too long';
    }


    if (!email) {
        errors.email = 'Email is required';
    } else if (!validator.isEmail(email)) {
        errors.email = 'Email is invalid';
    }

    if (!password) {
        errors.password = 'Password is required';
    } else if (!validator.isStrongPassword(password)) {
        errors.password = 'Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one number, and one special character';
    }

    if (!firstName) {
        errors.firstName = 'First name is required';
    } else if (!validator.isAlpha(firstName)) {
        errors.firstName = 'First name must contain only letters';
    }

    if (!lastName) {
        errors.lastName = 'Last name is required';
    }else if (!validator.isAlpha(lastName)) {
        errors.lastName = 'Last name must contain only letters';
    }


    if (Object.keys(errors).length > 0) {
        return res.status(400).json(errors);
    }

    next();
};