const express = require('express');
const moment = require('moment');
const app = express();
app.use(express.json());

function init(globals, matches) {

    // Initialise the endpoints and start the web server
    initEndpoints(globals, matches);
    app.listen(globals.server.port, () => {
        console.info(`Server is running on port ${globals.server.port}`);
    });
}

function initEndpoints(globals, matches) {

    // Healthcheck
    app.get('/api/v1/healthcheck', (req, res) => {
        res.json({ status: 'ok', source: globals.config.matches.source });
    });

    // Returns matches when the date querystring is today's date in YYYYMMDD format
    // This is to simulate the behaviour of the real backend API 
    app.get('/api/v1/matches', (req, res) => {
        const date = req.query.date;
        const todaysDate = moment().format('YYYYMMDD');
        if (date && date === todaysDate) {
            res.json(matches.getMatches(globals));
        }
        else {
            res.json({});
        }
    });

    // Reset all matches
    app.post('/api/v1/reset/matches/all', (req, res) => {
        matches.resetAllMatches(globals);
        res.json(globals.data.matches);
    });

    // Kick off all matches
    app.post('/api/v1/kickoff/matches/all', (req, res) => {
        matches.kickOffAllMatches(globals);
        res.json(globals.data.matches);
    });

}

module.exports = {
    init
}