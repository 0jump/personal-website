'use strict';
const config = require('./config');
const nodeMailer = require('nodemailer');

let transporter = nodeMailer.createTransport({
    host: config.emails.transporterOptions.host,
    port: config.emails.transporterOptions.port,
    secure: config.emails.transporterOptions.secure,
    auth: {
        user: config.emails.notifications.user,
        pass: config.emails.notifications.pass
    }
});


let getNotificationsMailOptions = (to, subject, text, html) => {
    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Gerard Antoun Notifications" <notifications@gerardantoun.com>', // sender address
        to: to, // list of receivers
        subject: 'GA.com - ' + subject, // Subject line
        text: text, // plain text body
        html: html // html body
    }

    return mailOptions;
}

let mySmtp = {};

mySmtp.send = {};

mySmtp.send.NotificationsEmail = (to, subject, text, html) => {
    // send mail with defined transport object
    transporter.sendMail(getNotificationsMailOptions(to, subject, text, html), (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });
}

mySmtp.send.notifications = {};

mySmtp.send.notifications.homePageVisit = () => {
    // send mail with defined transport object
    transporter.sendMail(getNotificationsMailOptions('gerard.antoun@yahoo.com', 'Website Visit', 'Test', "<b>BIG TEST</b>"), (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });
}

module.exports = mySmtp;