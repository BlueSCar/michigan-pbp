var schedule = require('node-schedule');
var cfb = require('cfb-data');
var config = require('./config/config');

var bot = require('./app/bot');
var playService = require('./app/services/play.service');
var tweetService = require('./app/services/tweet.service');

var gameService = require('./app/services/game.service');

var gameCheckRule = new schedule.RecurrenceRule();
gameCheckRule.hour = 1;
gameCheckRule.minute = 0;

var gameJob = schedule.scheduleJob(gameCheckRule, function () {
    console.log('Checking for games today...');

    var games = new gameService(cfb, config.teamId);
    games.gameCheck(function (event) {
        console.log('Scheduling game for today...');

        var plays = new playService(cfb, event.id);
        var tweeter = new tweetService(bot, plays);

        var hashTag = event.competitions[0].competitors[1].team.abbreviation + 'vs' + event.competitions[0].competitors[0].team.abbreviation;
        tweeter.setHashTag(hashTag);

        var eventDate = new Date(event.date);
        var startHour = eventDate.getHours();
        var endHour = startHour + 4;

        var tweetRule = new schedule.RecurrenceRule();
        tweetRule.year = eventDate.getFullYear();
        tweetRule.month = eventDate.getMonth();
        tweetRule.date = eventDate.getDate();
        tweetRule.hour = schedule.Range(startHour, endHour);

        var tweetJob = schedule.scheduleJob(tweetRule, function () {
            console.log('Looking for plays and sending tweets...');
            tweeter.sendTweets();
        });
    });
});

console.log('Ready to tweet!');