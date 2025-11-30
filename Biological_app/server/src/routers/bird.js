const express = require('express');
const sha = require('js-sha256');
const dbp = require('../db/post');
const querystring = require('querystring');
const check_admin = require('../middleware/check_admin.js');
const tch = require('../tool/typeCheck.js');
const { query, validationResult } = require('express-validator');
const router = express.Router();
const pino = require('pino');
const logger = pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
});
router.use(express.json());

router.get('/data_bird', function (req, res, next){
    const {uuid} = res.locals;
    const { st, num } = req.query;  
    if(st == undefined || num == undefined){
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "You lack necessary parameter"
            }
        );
        return;
    }
    if (!tch.checkInt(st) || !tch.checkInt(num)) {
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "wrong parameter range"
            }
        );
        return; 
    }
    dbp.user_get_bird(uuid, parseInt(st), parseInt(num)).then((data)=>{
        ret = {};
        ret["len"] = data.length;
        ret["data"] = data;
        js = JSON.stringify(ret);
        res.send(js)

    }).catch((err)=>{
        logger.error(err)
        res.status(500).send();
    })
});

router.post('/data_bird', function (req, res, next){
    const {uuid, username} = res.locals;
    const {name, description, photo, lon, lat, time} = req.body;
    if(name == undefined || description == undefined || photo == undefined || lon == undefined || lat == undefined || photo == undefined){
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "You lack necessary parameter"
            }
        );
        return;
    }
    if(name.length > 1000 || description.length > 1000){
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "Name or description text exceed limit"
            }
        );
        return; 
    }
    if (!tch.checkFloat(lon) || !tch.checkFloat(lat) || (time != undefined && !tch.checkFloat(time))) {
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "wrong parameter range"
            }
        );
        return; 
    }
    dbp.upload_bird(name, description, photo, lon, lat, username, time, uuid).then((id)=>{
        res.json({"status":"success", "id":id});
    }).catch((err)=>{
        logger.error(err)
        res.status(500).send();
    })
});

router.post('/data_bird_test', async function (req, res, next){
    const {uuid, username} = res.locals;
    const {name, description, photo, lon, lat, time} = req.body;
    if(name == undefined || description == undefined || photo == undefined || lon == undefined || lat == undefined || photo == undefined){
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "You lack necessary parameter"
            }
        );
        return;
    }
    if(name.length > 1000 || description.length > 1000){
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "Name or description text exceed limit"
            }
        );
        return; 
    }
    if (!tch.checkFloat(lon) || !tch.checkFloat(lat) || (time != undefined && !tch.checkFloat(time))) {
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "wrong parameter range"
            }
        );
        return; 
    }
    try{
        let parseTime = parseInt(time)
        const sql = `
            INSERT INTO birdtest(name, description, photo, lon, lat, creator, time, account_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;
        `;
        
        let id = await db.one(sql, [name,description, photo, lon, lat, username, parseTime, uuid]);
        res.json({"status":"success", "id":id});
    }catch(err){
        logger.error(err)
        res.status(500).send();
    }
});


router.put('/data_bird', function (req, res, next){
    const {uuid, is_admin} = res.locals;
    const {id, name: _name, description: _description, photo, lon, lat, time, invalid, upload} = req.body;
    let description = "";
    let name = "";
    if(photo == undefined){
        res.status(400).json({
            "status": "error",
            "code": 400,
            "message": "You lack necessary parameter"
        });
        return;
    }
    if(_description != undefined){
        description = _description;
    }else{
        description = _description
    }
    if(_name != undefined){
        name = _name 
    }
    if ((id != undefined && !tch.checkInt(id)) || (lon != undefined && !tch.checkFloat(lon)) || 
        (lat != undefined && !tch.checkFloat(lat)) || (time != undefined && !tch.checkFloat(time)) || 
        (invalid != undefined && !tch.checkBool(invalid)) || (upload != undefined && !tch.checkBool(upload))) {
        console.log(id, lon,lat, invalid, time)
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "wrong parameter range"
            }
        );
        return; 
    }
    dbp.get_data(id).then((data)=>{
        if (data == undefined) {
            res.status(200).json(
                {
                    "status": "warning",
                    "code": 200,
                    "message": "This id doesn't exist"
                }
            );
        } else if (uuid != data.account_id && !is_admin) {
            res.status(503).json(
                {
                    "status": "error",
                    "code": 503,
                    "message": "You have not permission to modify"
                }
            );
        }else {
            // if (data.upload) {
            //     res.status(400).json(
            //         {
            //             "status": "error",
            //             "code": 400,
            //             "message": "This id has been uploaded"
            //         }
            //     );
            //     return;
            // }
            dbp.check_invalid_data(id, invalid);
            dbp.change_data_bird(id, name, description, photo, lon, lat, uuid, time, upload).then(()=>{
                res.json({
                    "status":"success"
                });
            }).catch((err)=>{
                logger.error(err)
                res.status(500).json(
                    {
                        "status": "error",
                        "code": 500,
                        "message": "Server error"
                    }
                );
            });
        }
    }).catch((err)=>{
        logger.error(err)
        res.status(500).send();
    })
});

router.delete('/data_bird', function (req, res, next){
    const {uuid,  is_admin } = res.locals;
    const { id, invalid } = req.query;
    if(id == undefined){
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "You lack necessary parameter"
            }
        );
        return;
    }
    if (!tch.checkInt(id) || (invalid != undefined && !tch.checkBool(invalid))) {
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "wrong parameter range"
            }
        );
        return; 
    }
    dbp.get_data(id).then((data)=>{
        if (data == undefined) {
            res.status(400).json(
                {
                    "status": "error",
                    "code": 400,
                    "message": "This id doesn't exist"
                }
            );
        } else if ((uuid != data.account_id && !is_admin) || (invalid && !is_admin)) {
            res.status(400).json(
                {
                    "status": "error",
                    "code": 400,
                    "message": "You have not permission to delete"
                }
            );
        } else {
            // if (data.upload) {
            //     res.status(400).json(
            //         {
            //             "status": "error",
            //             "code": 400,
            //             "message": "This id has been uploaded"
            //         }
            //     );
            //     return;
            // }
            dbp.check_invalid_data(id, invalid);
            dbp.delete_data_bird(id);
            res.json({"status":"success"});
        }
    }).catch((err)=>{
        logger.error(err)
        res.status(500).send();
    })
});

router.post('/money', function (req, res, next){
    const {uuid} = res.locals;
    const {toUuid, money} = req.body;
    if(name == undefined || money == undefined){
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "You lack necessary parameter"
            }
        );
        return;
    }
    if (!tch.checkInt(money)) {
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "wrong parameter range"
            }
        );
        return; 
    }
    if(parseInt(money) < 0){ 
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "money doesn't less then zero"
            }
        );
        return;
    }
    dbp.giveMoney(uuid, toUuid, money).then(()=>{
        res.json({
            "status":"success"
        });
    }).catch((err)=>{
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": err.toString()
            }
        );
    });
});

router.get('/money', function (req, res, next){
    const {uuid} = res.locals;
    dbp.getMoney(uuid).then((money)=>{
        if(money == null){
            res.status(400).json(
                {
                    "status": "error",
                    "code": 400,
                    "message": "User doesn't exist"
                }
            );
        }else{
            res.json(
                {
                    "status": "success",
                    "money": money.money
                }
            );
        }
    })
});

router.get('/near_data_bird',[
    query('st').notEmpty().isInt().escape(),
    query('num').notEmpty().isInt({ min: 0, max: 5000 }).escape(),
    query('lon').notEmpty().isFloat().escape().optional({ nullable: true }),
    query('lat').notEmpty().isFloat().escape().optional({ nullable: true }),
    query('filter').escape().optional({ nullable: true }),
    query('sort').escape().optional({ nullable: true }),
    query('order').escape().optional({ nullable: true }),
    query('id').isInt().escape().optional({ nullable: true }),
                                    ], function (req, res, next){
    // let {st, num, filter, sort, order, lon, lat, id} = req.query;
    const {uuid, is_admin} = res.locals;
    let st = req.query.st;
    let num = req.query.num;
    let lon = req.query.lon == undefined ? undefined : parseFloat(req.query.lon);
    let lat = req.query.lat == undefined ? undefined : parseFloat(req.query.lat);
    let filter = req.query.filter == undefined ? undefined : querystring.escape(req.query.filter);
    let sort = req.query.sort == undefined ? undefined : querystring.escape(req.query.sort);
    let order = req.query.order == undefined ? undefined : querystring.escape(req.query.order);
    let id = req.query.id == undefined ? undefined : querystring.escape(req.query.order);
    const validResult = validationResult(req);
    // by default
    let upload = 'true';
    let invalid = 'false';
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
    if (!validResult.isEmpty()) {
        // allow admin to get all data
        if(!(validResult.errors[0].path == "num" && validResult.errors[0].value > 5000 && is_admin)){
            res.status(400).json(
                {
                    "status": "error",
                    "code": 400,
                    "message": "wrong parameter range"
                }
            );
        }
        return; 
    }
    if ((sort != undefined && order != undefined)) {
        if (["DESC", "ASC"].findIndex((ele) => ele == order) == -1 || ["id", "name", "description", "lon", "lat", "time"].findIndex((ele) => ele == sort) == -1) {
            res.status(400).json(
                {
                    "status": "error",
                    "code": 400,
                    "message": "wrong parameter range"
                }
            );
            return; 
        }
    }
    dbp.get_uncheck_data(parseInt(st), parseInt(num), filter, sort, order, upload, lon, lat, id, invalid).then((data)=>{
        ret = {};
        ret["len"] = data.length;
        ret["data"] = data;
        dbp.get_uncheck_data_total(filter, upload, lon, lat, id, invalid).then((total) => {
            ret["total"] = total.count
            js = JSON.stringify(ret);
            res.send(js)
        })

    }).catch((err)=>{
        logger.error(err)
        res.status(500).send();
    })
});

router.use(check_admin);

router.post('/uncheck_data_bird', function (req, res, next){
    const {id} = req.body;
    if(id == undefined){
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "You lack necessary parameter"
            }
        );
        return;
    }
    if (!tch.checkInt(id)) {
        res.status(400).json(
            {
                "status": "error",
                "code": 400,
                "message": "wrong parameter range"
            }
        );
        return; 
    }
    dbp.get_data(id).then(data=>{
        if(data == null){
            res.status(400).json(
                {
                    "status": "error",
                    "code": 400,
                    "message": "Don't find this id"
                }
            );
            return;
        }
        if(data.upload){
            res.status(400).json(
                {
                    "status": "error",
                    "code": 400,
                    "message": "This data has been upload"
                }
            );
            return;
        }
        dbp.change_data_upload(id).then((hash)=>{
            res.json({
                "status":"success",
            });
            return;
        }).catch((err)=>{
            logger.error(err);
            res.status(500).send();
        })
    }).catch((err)=>{
        logger.error(err);
        res.status(500).send();
    })
});

router.get('/uncheck_data_bird',[
    query('st').notEmpty().isInt().escape(),
    query('num').notEmpty().isInt({ min: 1, max: 5000 }).escape(),
    query('lon').isFloat().escape().optional({ nullable: true }),
    query('lat').isFloat().escape().optional({ nullable: true }),
    query('filter').escape().optional({ nullable: true }),
    query('sort').escape().optional({ nullable: true }),
    query('order').escape().optional({ nullable: true }),
    query('id').isInt().escape().optional({ nullable: true }),
    query('startTime').escape().optional({ nullable: true }),
    query('endTime').escape().optional({ nullable: true }),
    query('upload').isBoolean().escape().optional({ nullable: true }),
    query('invalid').isBoolean().escape().optional({ nullable: true }),
                                    ], function (req, res, next){
    // const {st, num, filter, sort, order, upload, lon, lat, id, invalid, startTime, endTime} = req.query;
    const {uuid, is_admin} = res.locals;
    let st = parseInt(req.query.st);
    let num = parseInt(req.query.num);
    let filter = req.query.filter == undefined ? undefined : decodeURIComponent(querystring.escape(req.query.filter));
    let lon = req.query.lon == undefined ? undefined : parseFloat(req.query.lon);
    let lat = req.query.lat == undefined ? undefined : parseFloat(req.query.lat);
    let sort = req.query.sort == undefined ? undefined : querystring.escape(req.query.sort);
    let order = req.query.order == undefined ? undefined : querystring.escape(req.query.order);
    let upload = req.query.upload == undefined ? undefined : querystring.escape(req.query.upload);
    let id = req.query.id == undefined ? undefined : parseInt(req.query.id);
    let invalid = req.query.invalid == undefined ? undefined : querystring.escape(req.query.invalid);
    let startTime = req.query.startTime == undefined ? undefined : querystring.escape(req.query.startTime);
    let endTime = req.query.endTime == undefined ? undefined : querystring.escape(req.query.endTime);
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
    if (!validResult.isEmpty()) {
        // allow admin to get all data
        if(!(validResult.errors[0].path == "num" && validResult.errors[0].value > 5000 && is_admin)){
            res.status(400).json(
                {
                    "status": "error",
                    "code": 400,
                    "message": "wrong parameter range"
                }
            );
            return; 
        }
    }
    if ((sort != undefined && order != undefined)) {
        if (["DESC", "ASC"].findIndex((ele) => ele == order) == -1 || ["id", "name", "description", "lon", "lat", "time"].findIndex((ele) => ele == sort) == -1) {
            res.status(400).json(
                {
                    "status": "error",
                    "code": 400,
                    "message": "wrong parameter range"
                }
            );
            return; 
        }
    }
    _startTime = Date.parse(String(startTime));
    if(isNaN(_startTime)){
        _startTime = undefined;
    }else{
        _startTime /= 1000;
    }
    _endTime = Date.parse(String(endTime));
    if(isNaN(_endTime)){
        _endTime = undefined;
    }else{
        _endTime /= 1000;
    }
    dbp.get_uncheck_data(parseInt(st), parseInt(num), filter, sort, order, upload, lon, lat, id, invalid, _startTime, _endTime).then((data)=>{
        ret = {};
        ret["len"] = data.length;
        ret["data"] = data;
        dbp.get_uncheck_data_total(filter, upload, lon, lat, id, invalid, _startTime, _endTime).then((total) => {
            ret["total"] = total.count
            js = JSON.stringify(ret);
            res.send(js)
        })

    }).catch((err)=>{
        logger.error(err)
        res.status(500).send();
    })
});


module.exports = router;
