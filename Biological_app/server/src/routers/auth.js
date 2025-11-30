const express = require('express');
const jwt = require('jsonwebtoken');
const dbp = require('../db/auth.js');
const saltedSha256 = require('salted-sha256');
const login_check = require('../middleware/login_check.js');
const check_admin = require('../middleware/check_admin.js');
const mail_sender = require('../tool/mail.js');
const phone_auth = require('../tool/phone.js');
const fs = require('fs');
const tch = require('../tool/typeCheck.js');
const compare = require('secure-compare');

var pino = require('pino');
const logger = pino({
    prettyPrint: {
        colorize: true,
        translateTime: true,
    }
  })

const router_Login = express.Router();
const router_nonLogin = express.Router();

router_nonLogin.use(express.json());
router_Login.use(express.json());



        
function testRegister(input) {
    let format = /^(?=.*\d)((?=.*[a-z])|(?=.*[A-Z])).{8,128}$/
    return format.test(input)
}
const loginLogFile = pino({
    prettyPrint: {
        colorize: false,
        // singleLine: true,
        ignore: 'level,time,pid,hostname',
    }},
    pino.destination({ dest: './loginLog.txt', sync: false })
);
  

router_nonLogin.post('/login', function (req, res, next) {
    const { phone, password } = req.body;
    const ip = String(req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress)
    date = new Date();
    if (phone == undefined || password == undefined){
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "You lack necessary parameter"
            }
        );
        return;
    }
    if(!tch.checkPhone(phone) && phone != "admin"){
        res.status(400).json(
            {
                "status": "error",
                "code": 1005,
                "message": "Wrong phone format"
            }
        );
        return;
    }
    dbp.query_name_phone(phone).then((data) => {
        if (data == undefined) {
            res.status(400).json(
                {
                    "status": "error",
                    "code": 1001,
                    "message": "username does not exist"
                }
            );
            logger.warn(`LOGIN\t${ip}\t${phone}\tFAIL\Phone does not exist`);
            loginLogFile.info(date + ' ' + phone + ' ' + String(req.headers['x-forwarded-for'] || req.socket.remoteAddress) + ' login failed\n');
            return;
        }
        if (Date.now() < data.ban_time) {
            res.status(400).json(
                {
                    "status": "error",
                    "code": 1010,
                    "message": "Your account have been lock"
                }
            );
            return
        }
        if (!compare(data.password, saltedSha256(password, data.salt))) {
            res.status(400).json({
                "status": "error",
                "code": 1002,
                "message": "wrong password or phone number"
            });
            logger.warn(`LOGIN\t${ip}\t${phone}\tFAIL\tWrong password`);
            loginLogFile.info(date + ' ' + phone + ' ' + String(req.headers['x-forwarded-for'] || req.socket.remoteAddress) + ' login failed\n');
            dbp.loginFail(data);
            return;
        }
        if (data.login_Fail_num != 0) dbp.clearFail(phone);
        const accessToken = jwt.sign({username: data.ac, is_admin: data.admin, email: data.email, uuid: data.uuid }, process.env.AUTH_SECRET, {expiresIn: '3650d'});
        // req.session.accessToken = accessToken;
        userStatus = parseInt(data.status);
        userUUID = String(data.uuid);
        res.json({
            "status": "successful",
            "data":[accessToken, data.status, userUUID]
        });
        logger.info(`LOGIN\t${ip}\t${phone}\tSUCCESS\tLogin successful`);
        loginLogFile.info(date + ' ' + phone + ' ' + String(req.headers['x-forwarded-for'] || req.socket.remoteAddress) + ' login\n');
        return;
    }).catch((err) => {
        logger.error(err);
        res.status(500);
    })
});

router_nonLogin.post('/forgetPassword', function(req, res, next){
    const { email } = req.body;

    if ( email == undefined) {
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "You lack necessary parameter"
            }
        );
        return;
    }
    dbp.query_email_exist(email).then(data => {
        if (data == undefined) {
            res.status(400).json(
                {
                    "status": "error",
                    "code": 1006,
                    "message": "This email has not exist"
                }
            );
            return;
        }
        mail_sender.sendResetMail(email, data.uuid, data.account, req, res).then(result => {
            if (result) {
                res.json(
                    {
                        "status": "successful",
                    }
                );
            }
        })
    });
});

router_nonLogin.post("/resetPassword", function (req, res, next) {
    const { password } = req.body;
    const { accessToken } = req.body;
    if (accessToken == undefined || password == undefined) { 
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "You lack necessary parameter"
            }
        );
        return;
    }else {
        try{
            jwt.verify(accessToken, process.env.EMAIL_SECRET, (err, user) => {
                if(password.length > 100){
                    res.status(400).json(
                        {
                            "status": "error",
                            "code": 1005,
                            "message": "Your information length exceed limit"
                        }
                    );
                    return;
                }
                if (!testRegister(password)) {
                    res.json(
                        {
                            "status": "error",
                            "code": 1005,
                            "message": "Wrong password format"
                        }
                    );
                    return;
                } 
                dbp.update_password(user.uuid, password);
                res.json({ "status": "success" });
            });
        }catch(err){
            if (err.message = 'jwt expired'){
                res.json(
                    {
                        "status": "error",
                        "code": 1005,
                        "message": "This operation is timeout"
                    }
                );
            }else {
                res.json(
                    {
                        "status": "error",
                        "code": 1005,
                        "message": "invalid verify"
                    }
                );
            }
        }
    }
});

router_nonLogin.post('/register',function (req, res, next){
    const { username, password, email, verifyid, name} = req.body;
    if (username == undefined || password == undefined || email == undefined || verifyid == undefined || name == undefined) {
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "You lack necessary parameter"
            }
        );
        return;
    }
    if(username.length > 100 || password.length > 100 || email.length > 100){
        res.status(400).json(
            {
                "status": "error",
                "code": 1005,
                "message": "Your information length exceed limit"
            }
        );
        return;
    }
    if(!testRegister(username) || !testRegister(password) || username == password || password.length > 32 || username.length > 32 || name.length > 32){
        res.status(400).json(
            {
                "status": "error",
                "code": 1005,
                "message": "Wrong username or password format"
            }
        );
        return;
    }
    phone_auth.verifyId(verifyid).then((phone) => {
        if(phone == undefined) {
            res.status(400).json(
                {
                    "status": "error",
                    "code": 1005,
                    "message": "Invalid verify id"
                }
            );
            return;
        }
        dbp.query_account_exist(email, phone).then(data => {
            if (data.length != 0) {
                for (let i = 0; i < data.length; i += 1) {
                    if (data[i].email == email) {
                        res.status(400).json(
                            {
                                "status": "error",
                                "code": 1006,
                                "message": "This email has been used"
                            }
                        );
                        break;
                    }else if (data[i].phone == phone) {
                        res.status(400).json(
                            {
                                "status": "error",
                                "code": 1006,
                                "message": "This phone has been used"
                            }
                        );
                        break;
                    }
                }
                return;
            }
            dbp.new_account(username, password, 0, false, email, phone, name).then((uuid) => {
                mail_sender.sendActiveMail(email, uuid.uuid, username, req, res, false);
                res.json(
                    {
                        "status": "successful",
                    }
                );
            }).catch(err => {
                res.status(500);
                logger.error(err);
            });
        });
    });
});

router_nonLogin.get("/checkEmail/:code", function (req, res, next) {
    try{
        
        let user = jwt.verify(req.params.code, process.env.EMAIL_SECRET)
        dbp.verifyEmail(user.uuid);
        res.send("verified");
    } catch(err) {
        if (err.message = 'jwt expired') {
            res.send("this operation is timeout");
        }else{
            res.send("invalid verify");
        } 
    }
});

router_Login.post("/checkEmail/", function (req, res, next) {
    const { uuid, username, email } = res.locals;
    mail_sender.sendActiveMail(email, uuid, username, req, res, true)
});

// router_Login.post("/logout" , function (req, res, next){
//     req.session.destroy();
//     res.json({"status":"success"});
// });

router_Login.post("/update_password", function (req, res, next){
    const {uuid} = res.locals;
    const {password} = req.body;
    if(!testRegister(password)){
        res.status(400).json(
            {
                "status": "error",
                "code": 1005,
                "message": "Wrong account or password format"
            }
        );
    }else{
        dbp.update_password(uuid, password);
        res.json({"status": "success"});
    }
});

router_Login.get('/login_check', function (req,res, next){
    login_check(req, res, function (){
        
        res.json({"status": "success"});
    });
});


router_Login.get('/admin', function (req, res, next){
    const { uuid } = req.query;
    if (uuid == undefined) {
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "You lack necessary parameter"
            }
        );
        return;
    }
    dbp.query_account(uuid).then(data=>{
        if(data != undefined && data.admin == true){
            res.json({"status": "success", "result":true});
        }else{
            res.json({"status": "success", "result":false});
        }
    })
});

router_Login.post('/admin',check_admin, function (req, res, next){
    const { is_admin } = res.locals
    const {uuid, admin} = req.body;
    if(admin == undefined){
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "You lack necessary parameter"
            }
        );
    }
    if(is_admin == false){
        res.status(503).json(
            {
                "status": "error",
                "code": 503,
                "message": "You have not permission to modify"
            }
        );
        return;
    }
    dbp.query_account(uuid).then(data=>{
        if(data == undefined){
            res.json({
                "status": "error",
                "code": "400",
                "message":"This account does not exist"
            });
            return;
        }else{
            dbp.set_admin(uuid, admin).then(data=>{
                res.json({"status": "success"});
            }).catch(err=>{
                res.status(500);
                logger.error(err)
            })
        }
    })
});

router_Login.post('/deleteAccount', function (req, res, next) {
    const { uuid } = res.locals;
    dbp.delete_user_data(uuid).then(() => {
        res.json({"status": "success"});
    })
});

module.exports = {
    router_nonLogin,
    router_Login
};