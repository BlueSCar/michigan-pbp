module.exports = function (cfb, teamId) {
    var self = this;
    self.cfb = cfb;
    self.teamId = teamId;

    self.gameCheck = () => {
        return cfb.scoreboard
            .getScoreboard({
                groups: 80
            })
            .then(getEvents);
    };

    let getEvents = (data) => {
        let today = new Date();

        if (data && data.events) {
            for (let event of data.events) {
                let eventDate = new Date(event.date);

                if (eventDate.getFullYear() != today.getFullYear() ||
                    eventDate.getMonth() != today.getMonth() ||
                    eventDate.getDate() != today.getDate()) {
                    continue;
                }

                for (let competitor of event.competitions[0].competitors) {
                    if (competitor.team.id == self.teamId) {
                        return new Promise((resolve) => resolve(event));
                    }
                }
            }
        }

        return new Promise((resolve) => resolve(null));
    }
};