var redis = require("redis");
var bluebird = require("bluebird");
var winston = require("winston");
var config = require('../config/config');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var redisConf = config.getSetting('redis');
winston.info('Trying to connect redis %s:%s', redisConf.host, redisConf.port);
var client = redis.createClient(redisConf.port, redisConf.host);

client.on('connect', function() {
    winston.info('Connected to REDIS');
});

function saveOffer(key, offer) {
    return client.existsAsync(key)
        .then(function(exists) {
            if (exists) {
                winston.error('Key already exist ' + key);
                return false;
            } else if (!exists) {
                client.set(key, JSON.stringify(offer));
                return offer;
            };
        });
}

exports.saveOffer = saveOffer;
