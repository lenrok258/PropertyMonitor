var winston = require('winston');
var _ = require('underscore');
var Promise = require('bluebird');

var config = require('./config/config');
var olxMonitor = require('./pages/olx/olxMonitor');
var otoDomMonitor = require('./pages/otodom/otoDomMonitor');

winston.info('Let\'s the scrapping begin...');

var results = [];

var olxSettings = config.getSetting('olx').categories[0];
results.push(olxMonitor.getProperties(olxSettings));

var otoDomSettings = config.getSetting('otodom').categories;
_.each(otoDomSettings, function(otoDomSetting) {
    results.push(otoDomMonitor.getProperties(otoDomSetting));
});

Promise.all(results).then(function(result) {
    winston.info('My work here is done...');
});
