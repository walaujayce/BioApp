const nodemailer = require('nodemailer');
const dbp = require('../db/auth.js');
const { google } = require("googleapis");
const jwt = require('jsonwebtoken');
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
    

  
function sendActiveMail(email, uuid, account, req, res, ret=false) {
    dbp.query_account(uuid).then((data) => {
        if (data.require_active_time > Date.now()) {
            res.status(400).json(
                {
                    "status": "error",
                    "code": 400,
                    "message": "Your request too frequent"
                }
            );
            return false;
        }
        code = jwt.sign({ uuid: uuid }, process.env.EMAIL_SECRET, {expiresIn: '20m'});
        html = `
        <body>
        <h1>Thank You!</h1>
        <p>Hi, ${account}</p>
        <p>Thank You for registing biological app.</p>
        <p>This is your active url, please clicks it.</p>
        <a href="https://bioapp-backend.yikuo.dev/api/checkEmail/${code}">https://bioapp-backend.yikuo.dev/api/checkEmail/${code}</a>
        <p>If you don't register. Please ignore this mail</p>
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
                to: data.email,
                subject: 'Thank You register biological app',
                html: html,
            },
            function(err) {
                if (err) {
                    console.error('Unable to send confirmation: ' + err.stack);
                }
            },
        );
        dbp.set_require_active_time(uuid, Date.now() + 1000 * 60 * 3);
        if (ret) {
            res.json(
                {
                    "status": "successful",
                }
            );
        }
        return true;
    });
}

async function sendResetMail(email, uuid, account, req, res, ret=false) {
    data = await dbp.query_account(uuid);
    if (data.require_active_time > Date.now()) {
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "Your request too frequent"
            }
        );
        return false;
    }
    code = jwt.sign({ uuid: uuid }, process.env.EMAIL_SECRET, {expiresIn: '20m'});
    html = `
    <body>
    <p>Hi, ${account}</p>
    <p>This is your reset url, please go to this website.</p>
    <a href="https://bioapp-backend.yikuo.dev/resetpassword?key=${code}">https://bioapp-backend.yikuo.dev/resetpassword?key=${code}</a>
    <p>If you don't do anything. Please ignore this mail</p>
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
            to: data.email,
            subject: 'Reset biological app password',
            html: html,
        },
        function(err) {
            if (err) {
                console.error('Unable to send confirmation: ' + err.stack);
            }
        },
    );
    dbp.set_require_active_time(uuid, Date.now() + 1000 * 60 * 3);
    return true;
}

module.exports = {
    sendActiveMail,
    sendResetMail,
}

