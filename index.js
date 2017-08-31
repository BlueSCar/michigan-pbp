 let schedule = require('node-schedule');
 let cfb = require('cfb-data');
 let config = require('./config/config');
 let Promise = require('bluebird');

 let bot = require('./app/bot');
 let playService = require('./app/services/play.service');
 let tweetService = require('./app/services/tweet.service');
 let gameService = require('./app/services/game.service');

 let gameCheckRule = new schedule.RecurrenceRule();
 gameCheckRule.hour = 1;
 gameCheckRule.minute = 0;

 let gameJob = schedule.scheduleJob(gameCheckRule, function () {
     console.log('Checking for games today...');

     let games = new gameService(cfb, config.teamId);
     games.gameCheck()
         .then((event) => {
             if (!event) {
                 return;
             }

             console.log('Scheduling game for today...');

             let plays = new playService(cfb, event.id);
             let tweeter = new tweetService(bot, plays, Promise);

             let hashTag = `${event.competitions[0].competitors[1].team.abbreviation}vs${event.competitions[0].competitors[0].team.abbreviation}`;
             tweeter.setHashTag(hashTag);

             let eventDate = new Date(event.date);
             let startHour = eventDate.getHours();
             let endHour = startHour + 4;

             console.log(`Game tweets start at ${startHour} and end at ${endHour}`);

             let tweetRule = new schedule.RecurrenceRule();
             tweetRule.year = eventDate.getFullYear();
             tweetRule.month = eventDate.getMonth();
             tweetRule.date = eventDate.getDate();
             tweetRule.hour = new schedule.Range(startHour, endHour);
             tweetRule.second = [0, 15, 30, 45];

             let tweetJob = schedule.scheduleJob(tweetRule, function () {
                 console.log('Looking for plays and sending tweets...');
                 tweeter.sendTweets();
             });
         });
 });

 console.log('Ready to tweet!');