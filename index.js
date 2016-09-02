var winston = require('winston');
var _ = require('underscore');
var Promise = require('bluebird');

var db = require('./dao/fileDao');
var config = require('./config/config');
var otoDomMonitor = require('./pages/otodom/otoDomMonitor');
var olxMonitor = require('./pages/olx/olxMonitor');
var email = require('./email/emailSender');

var otoDomSettings = config.getSetting('otodom').categories;
var olxSettings = config.getSetting('olx').categories;

var allOffers = [];

function fetchOtodomData() {
    return Promise
        .mapSeries(otoDomSettings, function(settings) {
            return otoDomMonitor.getOffers(settings);
        })
        .then(function(offers) {
            return allOffers.push(offers);
        })
}

function fetchOlxData() {
    return Promise
        .mapSeries(olxSettings, function(settings) {
            return olxMonitor.getOffers(settings);
        })
        .then(function(offers) {
            return allOffers.push(offers);
        })
}


db.openDb();

Promise
    .all([
        fetchOtodomData(),
        fetchOlxData()
    ])
    .then(function() {
        var emailMessage = "";
        _.each(allOffers, function(offersPerSrc) {
            _.each(offersPerSrc, function(offers) {
                    if (!_.isEmpty(offers.changedOffers)) {
                        emailMessage += email.prepareReport(offers.changedOffers, offers.description)
                        emailMessage += "<br/><br/>";
                    }
                }

            );
        });

        db.closeAndPersist();

        email.sendMail(emailMessage, function() {
            console.log(JSON.stringify(allOffers, null, 2));
            console.log('My work here is done');
            process.exit(0);
        })
    });
