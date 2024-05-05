const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3002;
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require('./routes/user.router');
app.use(logger('dev'));
app.use(express.json());
const baseURL = process.env.BASE_URL || 'http://localhost:5173';
app.use(cors({ origin: baseURL, credentials: true}));

mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

app.use('/api/users', userRouter);




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})