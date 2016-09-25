module.exports = function (cfb, teamId) {
    var self = this;
    self.cfb = cfb;
    self.teamId = teamId;

    self.gameCheck = function (callback) {
        cfb.scoreboard.getScoreboard({groups: 80}, function (data) {
            var today = new Date();

            if (data && data.events) {
                for (eventIndex in data.events) {
                    var event = data.events[eventIndex];
                    var eventDate = new Date(event.date);

                    if (eventDate.getFullYear() != today.getFullYear() ||
                        eventDate.getMonth() != today.getMonth() ||
                        eventDate.getDate() != today.getDate()) {
                        continue;
                    }

                    for (competitorIndex in event.competitions[0].competitors) {
                        var competitor = event.competitions[0].competitors[competitorIndex];

                        if (competitor.team.id == self.teamId) {
                            callback(event);
                        }
                    }
                }
            }
        });
    };
};