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
        let today = new Date().toDateString();

        if (data && data.events) {
            let teamEvents = data.events.filter((event) => {
                let eventDate = new Date(event.date).toDateString();
                let isToday = eventDate == today;
                let hasTeam = event.competitions[0].competitors.find((competitor) => competitor.team.id == self.teamId)
                return hasTeam;
            });

            if (teamEvents && teamEvents.length > 0) {
                return new Promise((resolve) => resolve(teamEvents[0]));
            }
        }

        return new Promise((resolve) => resolve(null));
    }
};