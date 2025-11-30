const express = require('express');
const dbpPost = require('../db/post');
const dbpAuth = require('../db/auth');
const tch = require('../tool/typeCheck.js');
const querystring = require('querystring');
const router = express.Router();
const { query, body, validationResult } = require('express-validator');
router.use(express.json());
const pino = require('pino');
const logger = pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
});

router.get('/user', [query('st').isNumeric().notEmpty().escape(), 
                    query('num').isNumeric().notEmpty().escape(),
                    query('uuid').escape().optional({ nullable: true }),
                    query('filter').escape().optional({ nullable: true }),
                    query('invalid').escape().optional({ nullable: true })], function (req, res, next) {
    let st = req.query.st;
    let num = req.query.num;
    let uuid = req.query.uuid == undefined ? undefined : querystring.escape(req.query.uuid);
    let filter = req.query.filter == undefined ? undefined : querystring.escape(req.query.filter);
    let invalid = req.query.invalid == undefined ? undefined : querystring.escape(req.query.invalid);
    const validResult = validationResult(req);
    if(!validResult.isEmpty() && validResult.errors[0].value == undefined) {
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "You lack necessary parameter"
            }
        );
        return;
    }
    if (!validResult.isEmpty() || parseInt(num) < 0 || parseInt(st) < 0) {
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "wrong parameter range"
            }
        );
        return; 
    }
    _invalid = undefined;
    if(String(invalid).toLocaleLowerCase() == "true" || String(invalid).toLocaleLowerCase() == "false"){
        if(String(invalid).toLocaleLowerCase() == "true"){
            _invalid = true;
        }else if(String(invalid).toLocaleLowerCase() == "false"){
            _invalid = false
        }
    }
    dbpAuth.get_user(parseInt(st), parseInt(num), filter, _invalid, uuid).then((data)=>{
        ret = {};
		ret["len"] = data.length;
		let returnData = []
		for (let i = 0; i < data.length && i < 1000; i = i + 1){
			let tmp = {}
			tmp["user"] = String(data[i].ac);
			tmp["email"] = data[i].email;
			tmp["admin"] = data[i].admin;
			tmp["blocked_time"] = data[i].blocked_time;
			tmp["id"] = data[i].uuid;
			tmp["name"] = data[i].name;
            tmp['phone'] = data[i].phone;
			returnData.push(tmp)
		}
		ret["data"] = returnData;
        dbpAuth.get_user_total(filter, _invalid).then((total) => {
            ret["total"] = total.count
            js = JSON.stringify(ret);
            res.send(js)
        }).catch((err)=>{
            logger.error(err)
            res.status(500)
        })

    }).catch((err)=>{
        logger.error(err)
        res.status(500)
    })
});
router.put('/user', [body('account').escape().notEmpty(), body('email').escape().notEmpty(), body('uuid').escape().notEmpty(),
                    body('name').escape().notEmpty(), body('phone').escape().notEmpty()], function (req, res, next) {
    const {uuid, account, email, name, phone} = req.body;
    const validResult = validationResult(req);
    if (!validResult.isEmpty() ) {
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "wrong parameter range"
            }
        );
        return; 
    }
    dbpAuth.query_account_exist(email, phone).then(data => {
        if (data.length != 0) {
            for (let i = 0; i < data.length; i += 1) {
                if (data[i].email == email && data[i].uuid != uuid) {
                    res.status(400).json(
                        {
                            "status": "error",
                            "code": 1006,
                            "message": "This email has been used"
                        }
                    );
                    return;
                }else if (data[i].phone == phone && data[i].uuid != uuid) {
                    res.status(400).json(
                        {
                            "status": "error",
                            "code": 1006,
                            "message": "This phone has been used"
                        }
                    );
                    return;
                }else if (data[i].account == account && data[i].uuid != uuid){
                    res.status(400).json(
                        {
                            "status": "error",
                            "code": 1006,
                            "message": "This account has been used"
                        }
                    );
                    return;
                }
            }
        }
        dbpAuth.update_user(uuid, account, email, name, phone).then(() => {
            res.json({"status": "success"});
        }).catch((err)=>{
            logger.error(err);
            res.status(500);
        })
    });
});

router.delete('/user', [body('uuid').escape().notEmpty()], function(req, res, next){
    const {uuid} = req.body;
    const validResult = validationResult(req);
    if (!validResult.isEmpty() ) {
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "wrong parameter range"
            }
        );
        return; 
    }
    dbpAuth.delete_user_data(uuid).then(() => {
        res.json({"status": "success"});
    }).catch((err)=>{
        logger.error(err);
        res.status(500);
    })
});

module.exports = router;
