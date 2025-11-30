require('dotenv').config();
const pgp = require('pg-promise')();
var pino = require('pino');
const logger = pino({
    prettyPrint: {
        colorize: true,
        translateTime: true,
    }
})

if (!global.db) {
    try {
        process.env.DB_URL = `postgres://${process.env.PG_USERNAME}:${process.env.PG_PASSWORD}@${process.env.PG_HOSTNAME}:${process.env.PG_PORT}/${process.env.PG_DB_NAME}`;
    // only used for debugging
    logger.info(`==DEBUG== process.env.DB_URL = ${process.env.DB_URL}`);
    } catch (err) {
    console.log(
        err,
        '\n\nError configuring the project. Have you set the environment veriables?'
    );
    }
    db = pgp(process.env.DB_URL);
}

async function upload_bird(name ,description, photo, lon, lat, creator, time, uuid){
    time = parseInt(time)
    const sql = `
        INSERT INTO bird(name, description, photo, lon, lat, creator, time, account_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;
    `;
    
    let id = await db.one(sql, [name,description, photo, lon, lat, creator, time, uuid]);
    return id.id;
    // const sql2 = `
    //     SELECT id FROM bird WHERE name=$1 AND description=$2 AND photo=$3 AND lon=$4 AND lat=$5 AND creator=$6 AND time=$7 ORDER BY id DESC;
    // `;
    // let data = await db.one(sql2, [name,description, photo, lon, lat, creator, time]);
    // return data.id;
}

function delete_data_bird(id){
    const sql = `
        DELETE FROM bird WHERE id=$1;
    ` 
    return db.none(sql, [id]);
}

function change_data_bird(id, name ,description, photo, lon, lat, uuid, time, upload){
    // const sql = `
    //     UPDATE bird 
    //     SET 
    //         name=$1,
    //         description=$2,
    //         photo=$3,
    //         lon=$4,
    //         lat=$5,
    //         uuid=$6,
    //         time=$7
    //     WHERE id=$8;
    // `;
    const sql = `
        UPDATE bird 
        SET 
            name=$1,
            description=$2
            ${upload == undefined ? "" : ", upload = $9 "}
        WHERE id=$8;
    `;
    return db.none(sql, [name,description, photo, lon, lat, uuid, time, id, upload]);
}

function user_get_bird(uuid, st, num){
    const sql = `
        SELECT * FROM bird WHERE account_id=$1 ORDER BY time DESC LIMIT $3 OFFSET $2;
    `;
    return db.any(sql, [uuid, st, num]);
}
// sql cmd sort order
// 1. lon and lat if exist
// 2. sort and order
function get_uncheck_data(st, num, filter, sort, order, upload, lon, lat, id, invalid, startTime, endTime) {
    let sf = 3.14159 / 180;
    const sql = `
        SELECT * FROM bird
        WHERE upload=${upload != undefined ? "$4" : false}
            ${id != undefined ? "AND id = $7" :""}
            ${filter != undefined ? `AND (name LIKE '%'|| $3 ||'%' OR description LIKE '%'|| $3 ||'%')` : ""}
            ${(lon != undefined && lat != undefined) ? "AND lon BETWEEN $5-0.1 AND $5+0.1 AND lat BETWEEN $6-0.1 AND $6+0.1":""}
            ${(invalid != undefined ) ? "AND invalid = $8":""}
            ${(startTime != undefined ) ? "AND time >= $9" : ""}
            ${(endTime != undefined ) ? "AND time <= $10" : ""}
        ORDER BY ${(lon != undefined && lat != undefined) ? `ACOS(SIN(lat*${sf})*SIN($6*${sf}) + COS(lat*${sf})*COS($6*${sf})*COS((lon-$5)*${sf}))` :
            ((sort != undefined && order != undefined) ? `${sort} ${order}` : "time DESC")}
        LIMIT $2 OFFSET $1;
    `;
    return db.any(sql,[st, num, filter, upload, lon, lat, id, invalid, startTime, endTime]);
}

function get_uncheck_data_total(filter, upload, lon, lat, id, invalid, startTime, endTime) {
    let sf = 3.14159 / 180;
    const sql = `
        SELECT COUNT(*) FROM bird
        WHERE upload=${upload != undefined ? "$2" : false}
            ${id != undefined ? "AND id = $5" :""} 
            ${filter != undefined ? `AND (name LIKE '%'|| $1 ||'%' OR description LIKE '%'|| $1 ||'%')` : ""}
            ${(lon != undefined && lat != undefined) ? "AND lon BETWEEN $3-0.1 AND $3+0.1 AND lat BETWEEN $4-0.1 AND $4+0.1":""}
            ${(invalid != undefined ) ? "AND invalid = $6":""}
            ${(startTime != undefined ) ? "AND time >= $7" : ""}
            ${(endTime != undefined ) ? "AND time <= $8" : ""}
    `;
    return db.one(sql,[filter, upload, lon, lat, id, invalid, startTime, endTime]);
}


function getMoney(uuid){
    const sql = `
        SELECT money FROM account WHERE uuid=$1;
    `;
    return db.oneOrNone(sql, [uuid]);
}

async function giveMoney(from, to, money){
    money = parseInt(money)
    let fromMoney = await getMoney(from);
    let toMoney = await getMoney(to);
    if(fromMoney == null || toMoney == null)throw new Error("User doesn't exist");
    if(money > fromMoney.money)throw Error("You don't have enough money");
    const sql=`
        UPDATE account
        SET money=$1
        WHERE uuid = $2;
    `;
    await db.none(sql,[parseInt(fromMoney.money) - money, from]);
    await db.none(sql,[parseInt(toMoney.money) + money, to]);
    return;
}

function get_data(id){ 
    const sql = `
    SELECT * FROM bird WHERE id=$1;
    `;
    return db.oneOrNone(sql,[id]);
}

function change_data_upload(id){ 
    const sql = `
        UPDATE bird
        SET upload=true,
        hash='noHash'
        WHERE id=$1;
    `;
    return db.none(sql,[id]);
}
async function delete_user_bird_data(uuid) { 
    const sql4 = `
            DELETE FROM bird WHERE account_id=$1 AND upload=false;
        `
    return db.none(sql4, [uuid]);
}
async function check_invalid_data(id, invalid) { 
    const sql1 = `
        SELECT * FROM bird WHERE id=$1;
    `
    bird_data = await db.one(sql1, [id]);
    if(invalid == bird_data.invalid) return;
    const sql2 = `
        SELECT * FROM account WHERE uuid=$1;
    `
    account_data = await db.one(sql2, [bird_data.account_id]);
    if(invalid == true){
        if (account_data.invalid_num + 1 < 10) {
            const sql3 = `
            UPDATE account SET invalid_num=$1 WHERE uuid=$2;
            `
            await db.none(sql3, [account_data.invalid_num + 1, bird_data.account_id]);
        } else {
            const sql3 = `
            UPDATE account SET status=2, blocked_time=$2 WHERE uuid=$1;
            `
            await db.none(sql3, [bird_data.account_id, Date.now()]);
            // await delete_user_bird_data(bird_data.creator)
        }
        const sql4 = `
        UPDATE bird SET invalid=true WHERE id=$1;
        `
        await db.none(sql4, [id]);
    }else{
        const sql3 = `
        UPDATE account SET invalid_num=$1 WHERE uuid=$2;
        `
        await db.none(sql3, [account_data.invalid_num - 1, bird_data.account_id]);
        const sql4 = `
        UPDATE bird SET invalid=false WHERE id=$1;
        `
        await db.none(sql4, [id]);
    }
}
module.exports = {
    upload_bird,
    user_get_bird,
    getMoney,
    giveMoney,
    get_uncheck_data,
    get_uncheck_data_total,
    get_data,
    change_data_upload,
    change_data_bird,
    delete_data_bird,
    check_invalid_data,
    delete_user_bird_data,
};
  