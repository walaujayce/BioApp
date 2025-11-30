const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    process.env.EMAIL_clientId,
    process.env.EMAIL_clientSecret,
    "https://developers.google.com/oauthplayground" // Redirect URL
);
oauth2Client.setCredentials({
    refresh_token: process.env.EMAIL_refresh
});
accessToken = oauth2Client.getAccessToken()
    

function sendRemindMail(email, number) {
    html = `
    <body>
    <p>Hi, admin</p>
    <p>There are ${number} uploads unconfirmed </p>
    </body>
    `;
    let mailTransport = nodemailer.createTransport( {
        service: "gmail",
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_ACCOUNT,
            clientId: process.env.EMAIL_clientId,
            clientSecret: process.env.EMAIL_clientSecret,
            refreshToken: process.env.EMAIL_refresh,
            accessToken: accessToken
        },
        tls: {
            rejectUnauthorized: false
            }
            
    });
    mailTransport.sendMail(
        {
            from: process.env.EMAIL_ACCOUNT,
            to: email,
            subject: 'Remind uncheck data',
            html: html,
        },
        function(err) {
            if (err) {
                console.error('Unable to send confirmation: ' + err.stack);
            }
        },
    );
    console.log("Send mail.")
}

module.exports = {
    sendRemindMail,
}

