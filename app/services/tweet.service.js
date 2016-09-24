module.exports = function (client, playService) {
    var self = this;
    self.client = client;
    self.playService = playService;
    self.hashTag = null;
    self.setHashTag = function (hashTag) {
        self.hashTag = hashTag;
    };

    self.sendTweets = function () {
        self.playService.getNewPlays(function (plays) {
            if (plays && plays.length > 0) {
                var tweets = [];

                for (play in plays) {
                    var results = self.trimTweet(plays[play]);
                    for (result in results) {
                        tweets.push(results[result]);
                    }
                }

                for (tweet in tweets) {
                    self.client.post('statuses/update', {
                        status: tweets[tweet]
                    }, function (error, tweet, response) {
                        if (error) console.error(error);
                    });
                }
            }
        });
    };

    self.trimTweet = function (tweet) {
        var tweets = [];

        if (self.hashTag) {
            tweet += ' #' + self.hashTag;
        }

        if (tweet.length > 140) {
            for (var i = 0; i < (tweet.length / 140); i++) {
                tweets.push(tweet.substr(140 * i, 140));
            }
        } else {
            tweets.push(tweet);
        }

        return tweets;
    };
};