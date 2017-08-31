module.exports = (cfb, gameId) => {
    let self = this;
    self.cfb = cfb;
    self.gameId = gameId;
    self.quarter = 0;
    self.seconds = 60 * 15;

    self.getNewPlays = () => {
        if (self.gameId) {
            return cfb.games
                .getPlayByPlay(self.gameId)
                .then(formatData);
        }
    };

    let formatData = (data) => {
        let playList = [];
        let newQuarter = self.quarter;
        let newSeconds = self.seconds;

        if (data.drives) {
            let drives = [];

            if (data.drives.previous) {
                drives = drives.concat(data.drives.previous);
            }

            if (data.drives.current) {
                drives = drives.concat(data.drives.current);
            }

            for (let drive of drives) {
                if (drive.plays) {
                    for (let play of drive.plays) {
                        let playQuarter = play.period.number;
                        let tokens = play.clock.displayValue.split(':');
                        let playSeconds = tokens[0] * 60 + tokens[1] * 1;

                        if (playQuarter > self.quarter || playSeconds < self.seconds) {
                            if (play.type.id != 66) {
                                let text = getPlayText(play, data);
                                playList.push(text);

                                if (newQuarter < playQuarter) {
                                    newQuarter = playQuarter;
                                }

                                if (newQuarter == playQuarter && newSeconds > playSeconds){
                                    newSeconds = playSeconds;
                                }

                                if (play.start.team.id != play.end.team.id && play.type.id != 66) {
                                    let text = getEndOfDriveInfo(play, data);
                                    playList.push(text);
                                }
                            } else {
                                let text = getFinalText(play, data);
                                playList.push(text);
                            }
                        }
                    }
                }
            }
        }

        if (self.gameId) {
            self.quarter = newQuarter
            self.seconds == newSeconds;
        }

        return new Promise((resolve) => resolve(playList));
    }

    let getPlayText = (play, data) => {
        let team = play.start.team.id == data.teams[0].id ? data.teams[0].team.abbreviation : data.teams[1].team.abbreviation;
        let downDistance = '';

        if (play.start.downDistanceText) {
            downDistance = play.start.downDistanceText
                .replace(' and ', '&')
                .replace('at', '@');
        }

        let playText = play.text;

        return `${team} ${downDistance}: ${playText}`;
    };

    let getEndOfDriveInfo = (play, data) => {
        let clock = play.clock.displayValue;
        let quarter = `Q${play.period.number}`;
        let score = getGameScore(play, data);

        return `${quarter} ${clock} - ${score}`;
    };

    let getFinalText = (play, data) => {
        let score = getGameScore(play, data);
        return `FINAL: ${score}`;
    };

    let getGameScore = (play, data) => {
        let homeScore;
        let awayScore;

        if (data.teams[0].homeAway == 'home') {
            homeScore = `${data.teams[0].team.abbreviation} ${play.homeScore}`;
            awayScore = `${data.teams[1].team.abbreviation} ${play.awayScore}`;
        } else {
            homeScore = `${data.teams[1].team.abbreviation} ${play.homeScore}`;
            awayScore = `${data.teams[0].team.abbreviation} ${play.awayScore}`;
        }

        return `${homeScore} ${awayScore}`;
    };
};