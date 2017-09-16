module.exports = function (client, playService, Promise) {
    let self = this;
    self.client = client;
    self.playService = playService;
    self.hashTag = null;
    self.setHashTag = (hashTag) => {
        self.hashTag = hashTag;
    };

    self.sendTweets = function () {
        self.playService
            .getNewPlays()
            .then(tweetPlays);
    };

    let trimTweet = (tweet) => {
        let tweets = [];

        if (self.hashTag) {
            tweet += ' #' + self.hashTag;
        }

        if (tweet.length > 140) {
            for (let i = 0; i < (tweet.length / 140); i++) {
                tweets.push(tweet.substr(140 * i, 140));
            }
        } else {
            tweets.push(tweet);
        }

        return tweets;
    };

    let tweetPlays = (plays) => {
        if (plays && plays.length > 0) {
            var tweets = [];

            for (play in plays) {
                let results = trimTweet(plays[play]);
                for (result in results) {
                    tweets.push(results[result]);
                }
            }

            let index = 0;
            let getNext = () => {
                if (index < tweets.length) {
                    index++;
                    return Promise.fromCallback((cb) => self.client.post('statuses/update', {
                            status: tweets[index - 1]
                        }, cb))
                        .then(getNext)
                        .catch((err) => {
                            console.log(err);
                            console.log(tweets[index - 1]);
                        });
                } else {
                    return new Promise((resolve) => resolve({}));
                }
            }

            return getNext();
        }
    }
};