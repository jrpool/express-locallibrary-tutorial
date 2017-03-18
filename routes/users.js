var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* Respond to request for praise. */
router.get('/cool', function(req, res) {
  res.send('You’re so cool, user!');
});

module.exports = router;
