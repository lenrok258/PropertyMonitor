var rp = require('request-promise');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var winston = require('winston');
var _ = require('underscore');
var dao = require('../../dao/redisDao');

var OTO_DOM_KEY = 'OTO_DOM';
var PAGE_TAG = '&page=';

function getOffers(olxSettings) {
    var requestOptions = {
        uri: olxSettings.url,
        transform: function(body) {
            return cheerio.load(body);
        }
    };

    return rp(requestOptions)
        .then(function($) {
            var numOfPages = $('#pagerForm').find('ul.pager').find('strong.current').text();
            if (!numOfPages) {
                numOfPages = 1;
            }
            winston.info('Oto Dom found %s pages with offers ', numOfPages);
            var obtainedOffers = [];
            for (var page = 1; page <= numOfPages; page++) {
                var offer = getOffersFromPage(requestOptions.uri, page);
                obtainedOffers.push(offer);
            }
            return Promise.all(obtainedOffers);
        }).then(function(obtainedOffers) {
            var newOffers = obtainedOffers.filter(function(elem) {
                return elem;
            });
            var allNewOffers = _.flatten(newOffers);
            var savedOffers = [];
            allNewOffers.forEach(function(prop) {
                var newOffer = dao.saveOffer(OTO_DOM_KEY + '-' + prop.id, prop);
                savedOffers.push(newOffer);
            });
            return Promise.all(savedOffers);
        }).then(function(savedOffers) {
            var changedOffers = savedOffers.filter(function(elem) {
                return elem;
            });
            var changedOffersReport = {
                description: olxSettings.description,
                changedOffers: changedOffers
            };
            return changedOffersReport;
        })
        .catch(function(err) {
            winston.error('error during scraping OTO DOM');
            winston.error(err);
            return false;
        });
}

function getOffersFromPage(siteUrl, siteNum) {
    var url = siteUrl + PAGE_TAG + siteNum;
    var requestOptions = {
        uri: url,
        transform: function(body) {
            return cheerio.load(body);
        }
    };

    return rp(requestOptions)
        .then(function($) {
            var offers = [];
            $('div.col-md-content').find('article').each(function(i, elem) {
                var offer = { id: '', name: '', url: '' };
                offer.name = $(elem).find('span.offer-item-title').text();
                offer.url = $(elem).attr('data-url');
                offer.id = $(elem).attr('data-url').replace('https://otodom.pl/oferta/', '');
                offer.id = offer.id.substring(0, offer.id.indexOf('.html#'));
                offers.push(offer);
            });

            return offers;
        })
        .catch(function(err) {
            winston.error('Error during getting announcement from page %s', siteNum);
            winston.error(err);
            return false;
        });
}

exports.getOffers = getOffers;
