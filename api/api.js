const express = require('express');
const apiRouter = express.Router();
const usersRouter = require('./users.js');

apiRouter.use('/users', usersRouter);

module.exports = apiRouter;