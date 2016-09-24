module.exports = function (cfb) {
    var self = this;
    self.cfb = cfb;
    self.gameId = null;
    self.timestamp = Date.now();

    self.setGameId = function (id) {
        self.reset();
        self.gameId = id;
    };

    self.getNewPlays = function (callback) {
        if (self.gameId) {
            cfb.games.getPlayByPlay(self.gameId, function (data) {
                var playList = [];
                var newTimestamp = self.timestamp;

                if (data.drives) {
                    var drives = [];

                    if (data.drives.previous) {
                        drives = drives.concat(data.drives.previous);
                    }

                    if (data.drives.current) {
                        drives = drives.concat(data.drives.current);
                    }

                    for (drive in drives) {
                        if (drive.plays) {
                            for (playIndex in drives[drive].plays) {
                                var play = drives[drive].plays[playIndex];
                                var playDate = new Date(play.wallclock);

                                if (playDate > self.timestamp) {
                                    if (play.type.id != 66) {
                                        var text = getPlayText(play, data);
                                        playList.push(text);

                                        if (newTimestamp < playDate) {
                                            newTimestamp = playDate;
                                        }

                                        if (play.start.team.id != play.end.team.id && play.type.id != 66) {
                                            var text = getEndOfDriveInfo(play, data);
                                            playList.push(text);
                                        }
                                    } else {
                                        var text = getFinalText(play, data);
                                        playList.push(text);
                                        self.reset();
                                    }
                                }
                            }
                        }
                    }
                }

                callback(playList);

                if (self.gameId) {
                    self.timestamp = newTimestamp;
                }
            });
        }
    };

    self.reset = function () {
        self.gameId = null;
        self.timestamp = Date.now();
    };

    var getPlayText = function (play, data) {
        var team = play.start.team.id == data.teams[0].id ? data.teams[0].team.abbreviation : data.teams[1].team.abbreviation;
        var downDistance = play.start.downDistanceText
            .replace(' and ', '&')
            .replace('at', '@');
        var playText = play.text;

        return team + ' ' + downDistance + ': ' + playText;
    };

    var getEndOfDriveInfo = function (play, data) {
        var clock = play.clock.displayValue;
        var quarter = 'Q' + play.period.number;
        var score = getGameScore(play, data);

        return quarter + ' ' + clock + ' - ' + score;
    };

    var getFinalText = function (play, data) {
        var score = getGameScore(play, data);
        return "FINAL: " + score;
    };

    var getGameScore = function (play, data) {
        var homeScore;
        var awayScore;

        if (data.teams[0].homeAway == 'home') {
            homeScore = data.teams[0].team.abbreviation + ' ' + play.homeScore;
            awayScore = data.teams[1].team.abbreviation + ' ' + play.awayScore;
        } else {
            homeScore = data.teams[1].team.abbreviation + ' ' + play.homeScore;
            awayScore = data.teams[0].team.abbreviation + ' ' + play.awayScore;
        }

        return homeScore + " " + awayScore;
    };
};