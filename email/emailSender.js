var nodemailer = require('nodemailer');
var winston = require('winston');
var config = require('../config/config');
var _ = require('underscore');

var emailConf = config.getSetting('email');

var transporter =
    nodemailer.createTransport('smtps://' + emailConf.email + ':' + emailConf.email_password + '@poczta.o2.pl');

function sendMail(payload, callback) {
    if (_.isEmpty(payload)) {
        callback();
        return;
    }

    var mailOptions = {
        from: emailConf.from,
        to: emailConf.recipients,
        subject: `${emailConf.subject} (${new Date})`,
        html: payload
    };

    // send mail with defined transport object
    return transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return winston.error(error);
        }
        winston.info('Message sent: ' + info.response);
        callback();
    });
}

function prepareReport(newOffers, title) {
    var payload = '<b>' + title + '</b><br><br><table>';
    newOffers.forEach(function(prop) {
        payload = payload +
            '<tr><td>' + prop.name + '</td>' +
            '<td><a href=\'' + prop.url + '\'>Link do oferty</a></td></tr>';
    });
    payload = payload + '</table>';
    return payload;
}

exports.sendMail = sendMail;
exports.prepareReport = prepareReport;
