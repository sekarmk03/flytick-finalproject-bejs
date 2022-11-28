const express = require('express');
const router = express.Router();
const auth = require('./auth');
const oauth = require('./oauth');
const user = require('./user');
const flight = require('./flight');
const country = require('./country');

router.use('/auth', auth);
router.use('/oauth', oauth);
router.use('/users', user);
router.use('/flight', flight);
router.use('/country', country);

module.exports = router;
