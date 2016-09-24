var schedule = require('node-schedule');
var cfb = require('cfb-data');
var config = require('./config/config');

var bot = require('./app/bot');
var playService = require('./app/services/play.service');
var tweetService = require('./app/services/tweet.service');

var plays = new playService(cfb);
plays.setGameId(400869658);

var tweeter = new tweetService(bot, plays);
tweeter.setHashTag(config.hashTag);

var rule = new schedule.RecurrenceRule();
rule.year = 2016;
rule.month = 8;
rule.date = 24;
rule.hour = schedule.Range(15,18);

var j = schedule.scheduleJob(rule, function(){
    tweeter.sendTweets();
});