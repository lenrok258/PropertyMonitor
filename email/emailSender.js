var nodemailer = require('nodemailer');
var winston = require('winston');
var config = require('../config/config');

var emailConf = config.getSetting('email');

var transporter =
    nodemailer.createTransport('smtps://' + emailConf.email + ':' + emailConf.email_password + '@poczta.o2.pl');

function sendMail(payload) {
    var mailOptions = {
        from: emailConf.from,
        to: emailConf.recipients,
        subject: `${emailConf.subject} (${new Date})`,
        html: payload
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return winston.error(error);
        }
        winston.info('Message sent: ' + info.response);
    });
}

function prepareReport(newProperties, title) {
    var payload = title + '<br><br><table>';
    newProperties.forEach(function(prop) {
        payload = payload +
            '<tr><td><b>' + prop.name + '</b></td>' +
            '<td><a href=\'' + prop.url + '\'>Link do oferty</a></td></tr>';
    });
    payload = payload + '</table>';
    return payload;
}

exports.sendMail = sendMail;
exports.prepareReport = prepareReport;
