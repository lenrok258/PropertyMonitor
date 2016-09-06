var fetchOffers = require('./fetch-offers')
var schedule = require('node-schedule');


console.log('Running daily');

var j = schedule.scheduleJob('0 0 0 * * *', function() {
    fetchOffers();
});
