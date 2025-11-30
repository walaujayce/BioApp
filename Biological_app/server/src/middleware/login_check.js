const jwt = require('jsonwebtoken');
const dbp = require('../db/auth.js');
const pino = require('pino');
const logger = pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
});

module.exports = function login_check(req, res, next) {
    
    const accesstoken = req.token;
    if(accesstoken == undefined){
        res.status(403).json(
            {
                "status": "error",
                "code": 1003,
                "message": "You haven't login"
            }
            );
            return false;
        }
        try {
            var user = jwt.verify(accesstoken, process.env.AUTH_SECRET);
            req.user = user;
            res.locals.username = user.username;
            res.locals.is_admin = user.is_admin;
            res.locals.email = user.email;
            res.locals.uuid = user.uuid;
            if(user.username == undefined || user.is_admin == undefined || user.email == undefined || user.uuid == undefined){
                res.status(403).json(
                    {
                        "status": "error",
                        "code": 1003,
                        "message": "You haven't login"
                    }
                );
            }else{
                dbp.query_account(user.uuid).then(data => {
                    if (data == null) {
                        res.status(403).json(
                            {
                                "status": "error",
                                "code": 1003,
                                "message": "You haven't login"
                            }
                        );  
                    }else if (data.status == 0 && req.path != "/api/checkEmail") {
                        res.status(403).json(
                            {
                                "status": "error",
                                "code": 1011,
                                "message": "You haven't active email"
                            }
                        );
                    } else if (data.status == 2) {
                        res.status(403).json(
                            {
                                "status": "error",
                                "code": 1012,
                                "message": "You have been blocked"
                            }
                        );
                    } else {
                        next();
                    }
                }).catch((err) => {
                    logger.error(err);
                    res.status(500);
                });
            }
        } catch(err) {
            res.status(403).json(
                {
                    "status": "error",
                    "code": 1003,
                    "message": "You haven't login"
                }
            );
        };
    return false;
};