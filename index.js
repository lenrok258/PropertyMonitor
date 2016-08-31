var winston = require('winston');
var _ = require('underscore');
var Promise = require('bluebird');

var config = require('./config/config');
var olxMonitor = require('./pages/olx/olxMonitor');
var otoDomMonitor = require('./pages/otodom/otoDomMonitor');

winston.info('Let\'s the scrapping begin...');

/*var results = [];*/

/*var olxSettings = config.getSetting('olx').categories;
_.each(olxSettings, function(olxSetting) {
	results.push(otoDomMonitor.getOffers(olxSetting));
});*/

//results.push(olxMonitor.getOffers(olxSettings));

offerPromises = [];

var otoDomSettings = config.getSetting('otodom').categories;
Promise.mapSeries(otoDomSettings, function(settings) {
    return otoDomMonitor.getOffers(settings);
}).then(function(offers) {

	console.log(offers);

	process.exit(0);
})

/*var report = email.prepareReport(changedOffers, olxSettings.description);
if (!_.isEmpty(changedOffers)) {
    console.log(`About to send email with: ${olxSettings.description}`)
    email.sendMail(report);
}
*/

