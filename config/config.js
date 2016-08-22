var fs = require('fs');

var config;

function getSetting(name){
	config = JSON.parse(fs.readFileSync(`${__dirname}/config.json`, 'utf8'));
    return config[name];
}

exports.getSetting = getSetting;