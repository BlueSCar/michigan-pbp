var config = require('../config/config');
var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: config.consumerKey,
    consumer_secret: config.consumerSecret,
    access_token_key: config.accessTokenKey,
    access_token_secret: config.accessTokenSecret
});

module.exports = client;