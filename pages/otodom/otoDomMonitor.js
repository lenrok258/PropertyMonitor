var rp = require('request-promise');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var winston = require('winston');
var _ = require('underscore');
var dao = require('../../dao/redisDao');
var email = require('../../email/emailSender');

var OTO_DOM_KEY = 'OTO_DOM';
var PAGE_TAG = '&page=';

function getProperties(olxSettings) {
    var options = {
        uri: olxSettings.url,
        transform: function(body) {
            return cheerio.load(body);
        }
    };

    var property = rp(options)
        .then(function($) {
            var numOfSites = $('#pagerForm').find('ul.pager').find('strong.current').text();
            winston.info('Oto Dom found %s sites ', numOfSites);
            winston.info('Using following URL %s', options.uri);
            winston.info('Start to scrape them all...');
            var sites = [];
            for (var site = 1; site <= numOfSites; site++) {
                var siteAnnouncement = getPropertiesFromSite(options.uri, site);
                sites.push(siteAnnouncement);
            }
            return Promise.all(sites);
        }).then(function(results) {
            var newProperties = results.filter(function(elem) {
                return elem;
            });
            var allNewProperties = _.flatten(newProperties);
            var savedProperties = [];
            allNewProperties.forEach(function(prop) {
                var newProp = dao.saveProperty(OTO_DOM_KEY + '-' + prop.id, prop);
                savedProperties.push(newProp);
            });
            return Promise.all(savedProperties);
        }).then(function(results) {
            var changedProperties = results.filter(function(elem) {
                return elem;
            });
            var report = email.prepareReport(changedProperties, olxSettings.description);
            winston.info("We've found following announcements: " + report);

            if (!_.isEmpty(changedProperties)) {
                email.sendMail(report);
            }

            var changedPropertiesReport = {
                description: olxSettings.description,
                changedProperties: changedProperties
            };
            return changedPropertiesReport;
        })
        .catch(function(err) {
            winston.error('error during scraping OTO DOM');
            winston.error(err);
            return false;
        });
    return property;
}

function getPropertiesFromSite(siteUrl, siteNum) {
    var url = siteUrl + PAGE_TAG + siteNum;
    var options = {
        uri: url,
        transform: function(body) {
            return cheerio.load(body);
        }
    };

    return rp(options).then(function($) {
            winston.info('get announcements from site no %s and following url:', siteNum);
            winston.info(options.uri);
            winston.info('------------------Announcements for site %s ----------------------------------', siteNum);
            var properties = [];
            $('div.col-md-content').find('article').each(function(i, elem) {
                var property = { id: '', name: '', url: '' };
                property.name = $(elem).find('span.offer-item-title').text();
                property.url = $(elem).attr('data-url');
                property.id = $(elem).attr('data-url').replace('https://otodom.pl/oferta/', '');
                property.id = property.id.substring(0, property.id.indexOf('.html#'));
                winston.info('found announcement %s', JSON.stringify(property));
                properties.push(property);
            });

            return properties
        })
        .catch(function(err) {
            winston.error('error during getting announcement from site %s', siteNum);
            winston.error(err);
            return false;
        });
}

exports.getProperties = getProperties;
