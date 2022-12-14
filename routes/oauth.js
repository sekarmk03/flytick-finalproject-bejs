const express = require('express');
const router = express.Router();
const h = require('../handlers');

router.post('/login/google', h.oauth.google);
router.get('/login/facebook', h.oauth.facebook);

module.exports = router;