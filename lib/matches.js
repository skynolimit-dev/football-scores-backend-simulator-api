const axios = require('axios');
const moment = require('moment');
const _ = require('lodash');

async function init(globals) {
    try {
        const url = globals.config.matches.source;
        console.info('Fetching matches from: ', url);
        const response = await axios.get(url);
        console.log('Response: ', response.code);
        const matchData = response.data;
        setMatches(globals, matchData);
    } catch (error) {
        console.error('Error fetching matches: ', error);
    }

}

function setMatches(globals, matchData) {
    globals.matches = [];
    const matchIds = globals.config.matches.matchIds;
    let matchesFound = 0;

    // Filter the matches
    for (const league of matchData.leagues) {
        for (const match of league.matches) {
            if (matchIds.includes(match.id)) {
                globals.data.matches.push(match);
                resetMatch(globals, match.id);
                matchesFound++;
            }
        }
    }

    console.info(`Found ${matchesFound} matches`);
}

// Reset all matches
function resetAllMatches(globals) {
    for (const match of globals.data.matches) {
        resetMatch(globals, match.id);
    }
}

// Reset the given match
function resetMatch(globals, matchId) {
    console.info(`Resetting match ${matchId}`);

    let match = globals.data.matches.find(m => m.id === matchId);
    const kickOffTime = moment().add(5, 'minutes');

    if (match) {
        _.set(match, 'status.utcTime', kickOffTime.toISOString());
        _.set(match, 'time', kickOffTime.format('DD.MM.YYYY HH:mm'));
        _.set(match, 'home.score', 0);
        _.set(match, 'away.score', 0);
        _.set(match, 'status.started', false);
        _.set(match, 'status.finished', false);
        _.set(match, 'status.cancelled', false);
        _.set(match, 'status.awarded', false);
        _.set(match, 'status.ongoing', true);
        _.set(match, 'status.scoreStr', '0 - 0');
        _.set(match, 'status.halfs.firstHalfStarted', kickOffTime.format('DD.MM.YYYY HH:mm:ss'));
        _.set(match, 'status.liveTime', {});
        _.set(match, 'status.reason', {});
    }
}

// Kick off all matches
function kickOffAllMatches(globals) {
    for (const match of globals.data.matches) {
        kickOffMatch(globals, match.id);
    }
}

// Kick off the given match
function kickOffMatch(globals, matchId) {
    console.info(`Kicking off match ${matchId}`);

    let match = globals.data.matches.find(m => m.id === matchId);
    const kickOffTime = moment();

    if (match) {
        _.set(match, 'status.reason', {});
        _.set(match, 'status.started', true);
        _.set(match, 'status.finished', false);
        _.set(match, 'status.halfs.firstHalfStarted', kickOffTime.format('DD.MM.YYYY HH:mm:ss'));
        updateMatchTime(globals, matchId);
    }
}

// Update the given match's time
function updateMatchTime(globals, matchId) {
    const match = globals.data.matches.find(m => m.id === matchId);
    if (match) {
        const updatedTime = getMatchTime(globals, matchId) + 1;
        console.log(`Updating match time for ${match.home.name} vs ${match.away.name}: ${updatedTime}`);
        _.set(match, 'status.liveTime', {
            short: `${updatedTime}’`,
            shortKey: '',
            long: `${updatedTime}:00`,
            longKey: '',
            maxTime: 90,
            addedTime: 0
        });

        // Pause for half time if we're at minute 45
        if (updatedTime === 45) {
            console.info(`Half time for ${match.home.name} vs ${match.away.name}`);
            _.set(match, 'status.reason', {
                short: "HT",
                shortKey: "halftime_short",
                long: "Half-Time",
                longKey: "halftime"
            });
            setTimeout(() => updateMatchTime(globals, matchId), globals.config.matches.halfTimeInterval);
        }
        else {
            // Start ths second half at minute 46
            if (updatedTime === 46) {
                _.set(match, 'status.reason', {});
                _.set(match, 'status.halfs.secondHalfStarted', moment().format('DD.MM.YYYY HH:mm:ss'));
            }

            // Finish the match if the time reaches 90
            if (updatedTime >= 90) {
                finishMatch(globals, matchId);
            }
            else {
                setTimeout(() => updateMatchTime(globals, matchId), globals.config.matches.updateInterval);
            }
        }
    }
}

// Gets the current time for the given match
function getMatchTime(globals, matchId) {
    const match = globals.data.matches.find(m => m.id === matchId);
    let currentTime = 0;
    if (match) {
        const currentTimeLabel = _.get(match, 'status.liveTime.short');
        if (currentTimeLabel) {
            currentTime = parseInt(currentTimeLabel.replace('’', ''));
        }
    }
    return currentTime;
}

// Finishes the given match
function finishMatch(globals, matchId) {

    let match = globals.data.matches.find(m => m.id === matchId);
    console.info(`Finishing match ${match.home.name} vs ${match.away.name}`);

    if (match) {
        _.set(match, 'status.finished', true);
        _.set(match, 'status.ongoing', false);
        _.set(match, 'status.liveTime', {});
        _.set(match, 'status.reason', {
            short: "FT",
            shortKey: "fulltime_short",
            long: "Full-Time",
            longKey: "finished"
        });
    }
}

// Gets matches
function getMatches(globals) {
    const data = {
        leagues: [
            {
                ccode: "INT",
                id: 881533,
                primaryId: 50,
                name: "EURO Final Stage",
                matches: globals.data.matches
            }
        ]
    };

    return data;

}

module.exports = {
    init,
    getMatches,
    kickOffAllMatches,
    resetAllMatches
}
