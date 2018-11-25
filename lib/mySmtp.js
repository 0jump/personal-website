'use strict';
const config = require('./config');
const nodeMailer = require('nodemailer');
const emailTempl = require('./email-templates');

// Email Templates
let tempData = [{
    "country": "China",
    "city": "Yudai",
    "visits": 42
}, {
    "country": "Colombia",
    "city": "Pensilvania",
    "visits": 20
}, {
    "country": "Croatia",
    "city": "Bobota",
    "visits": 150
}, {
    "country": "Ukraine",
    "city": "Mysove",
    "visits": 101
}, {
    "country": "Madagascar",
    "city": "Marovoay",
    "visits": 8
}, {
    "country": "Guatemala",
    "city": "Pastores",
    "visits": 14
}, {
    "country": "United States",
    "city": "Pittsburgh",
    "visits": 37
}];
let emTest =  emailTempl.dailyHomePageVisits.getHtml('25-11-2018', tempData);




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
        html: html, // html body
        headers: {
            'Precedence': 'bulk'
        }
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
    transporter.sendMail(getNotificationsMailOptions('gerard.antoun@yahoo.com, emilioantoun@gmail.com', 'Homepage Visit', 'No Plaintext', emTest), (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });
}


// ----- TESTING -----//

console.log('testing... \n');
mySmtp.send.notifications.homePageVisit();

module.exports = mySmtp;