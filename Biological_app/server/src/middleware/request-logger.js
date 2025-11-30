const fs = require('fs');
const jwt = require('jsonwebtoken');
const { request } = require('http');
const moment = require('moment');
var pino = require('pino')
const logger = pino({
    prettyPrint: {
        colorize: true,
        translateTime: true,
    }
  })
const logFile = pino({
    prettyPrint: {
        colorize: false,
        // singleLine: true,
        ignore: 'level,time,pid,hostname',
    }},
    pino.destination({ dest: './logs.txt', sync: false })
);
module.exports = function(req, res, next) {
    const accesstoken = req.token;
    jwt.verify(accesstoken, process.env.AUTH_SECRET, (err, user) => {
        if (err) {
            account = "Guest";
        }else{
            account  = user.username;
        }
        const log = `${String(req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress)} ${account} ${' '.repeat(7 - req.method.length)}${req.method}${' '.repeat(7 - req.method.length)}${req.url}\n`;
        logger.info(log);
        logFile.info(log);

        next();
    });
};
