var rp = require('request-promise');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var winston = require('winston');
var dao = require('../../dao/redisDao');
var email = require('../../email/emailSender');
var _ = require('underscore');

var OLX_KEY = 'OLX';

function getOffers(olxSettings) {

    var options = {
        uri: olxSettings.url,
        transform: function(body) {
            return cheerio.load(body);
        }
    };

    return rp(options)
        .then(function($) {
            var promises = [];
            var len = $('#offers_table').find('td.offer').length;
            $('#offers_table').find('td.offer').each(function(i, elem) {
                var property = { id: '', name: '', url: '' };
                property.id = $(elem).find('table').attr('data-id');
                property.name = $(elem).find('h3 strong').text();
                property.url = $(elem).find('h3 a').attr('href');
                var promise = dao.saveOffer(OLX_KEY + '-' + property.id, property);
                promises.push(promise);
            });

            return Promise.all(promises);
        }).then(function(results) {
            var changedOffers = results.filter(function(elem) {
                return elem;
            });
            winston.info('OLX: New offers count: %s', changedOffers.length);
            return report = {
                description: olxSettings.description,
                changedOffers: changedOffers
            };
        }).catch(function(err) {
            winston.error('error during scraping OLX');
            winston.error(err);
            return false;
        });
}

exports.getOffers = getOffers;
