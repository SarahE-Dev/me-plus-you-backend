const express = require('express');
const app = express();
const port = 3000;
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require('./routes/user.router');
app.use(logger('dev'));
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true}));
require('dotenv').config();
mongoose.connect(process.env.DB)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

app.use('/api/users', userRouter);




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})