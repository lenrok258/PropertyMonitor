var fs = require('fs');
var _ = require('lodash')

var configs = {};

function getSetting(name) {
    loadIfNeeded();
    return configs[name];
}

function loadIfNeeded() {
    if (_.isEmpty(configs)) {
        var config = JSON.parse(fs.readFileSync(`${__dirname}/config.json`, 'utf8'));
        var configSecret = JSON.parse(fs.readFileSync(`${__dirname}/config_secret.json`, 'utf8'));
        configs = _.merge({}, config, configSecret)
    }
}

exports.getSetting = getSetting;
