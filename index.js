var winston = require('winston');
var _ = require('underscore');
var Promise = require('bluebird');

var config = require('./config/config');
var olxMonitor = require('./pages/olx/olxMonitor');
var otoDomMonitor = require('./pages/otodom/otoDomMonitor');
var email = require('./email/emailSender');

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
    })
    .then(function(offersPerConfig) {

        var emailMessage = "";
        _.each(offersPerConfig, function(offers) {
            if (!_.isEmpty(offers.changedOffers)) {
                emailMessage += email.prepareReport(offers.changedOffers, offers.description) + "\n\n";
            }
        });
        email.sendMail(emailMessage, function() {
            console.log('My work here is done');
            process.exit(0);
        });
    })
