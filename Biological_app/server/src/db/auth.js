require('dotenv').config();
const saltedSha256 = require('salted-sha256');
const dbp = require('./post');
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
    const pgp = require('pg-promise')();
    db = pgp(process.env.DB_URL);
}
function query_account_exist(email, phone) {
    const sql = `
        SELECT * FROM account WHERE email=$1 OR phone=$2;
    `;
    return db.any(sql, [email, phone]);
}

function query_email_exist(email) {
    const sql = `
        SELECT * FROM account WHERE email=$1;
    `;
    return db.oneOrNone(sql, [email]);
}

function query_uuid(phone) {
    const sql = `SELECT uuid FROM account WHERE phone=$1;`;
    return db.oneOrNone(sql, [phone]);
}

function query_account(uuid){
    const sql = `
        SELECT * FROM account WHERE uuid=$1;
    `;
    return db.oneOrNone(sql, [uuid]);
}

function query_name_phone(phone){
    const sql = `
        SELECT *, account AS ac FROM account WHERE phone=$1;
    `;
    return db.oneOrNone(sql, [phone]);
}

function query_account_email(email){
    const sql = `
        SELECT * FROM account WHERE email=$1;
    `;
    return db.oneOrNone(sql, [email]);
}

function new_account(account, password, money, admin, email, phone, name) {
    if (admin == undefined) admin = false;
    if (money == undefined) money = 0;
    let salt = (Math.random() + 1).toString(36).substring(2);
    password = saltedSha256(password, salt);
    const sql = `
        INSERT INTO account(account, password, salt, money, admin, email, phone, name) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING uuid;
    `;
    return db.one(sql, [account, password, salt, money, admin, email, phone, name]);
}

function update_password(uuid, password) {
    let salt = (Math.random() + 1).toString(36).substring(2);
    password = saltedSha256(password, salt);
    const sql = `
        UPDATE account SET password=$1, salt=$3 WHERE uuid=$2;
    `;
    return db.none(sql, [password, uuid, salt]);
}

function set_admin(uuid, admin){
    const sql = `
        UPDATE account SET admin=$1 WHERE uuid=$2;
    `;
    return db.any(sql, [admin, uuid]);
}

function loginFail(data) {
    
    if (parseInt(data.login_fail_num) + 1 >= 3) {
        const sql = `
            UPDATE account SET
            login_fail_num=0,
            ban_time=$1
            WHERE uuid=$2;
        `
        return db.none(sql, [Date.now() + 10 * 60 * 1000, data.uuid]);
    } else {
        const sql = `
            UPDATE account SET login_fail_num=$1 WHERE uuid=$2;
        `
        return db.none(sql, [parseInt(data.login_fail_num) + 1, data.uuid]);
    }
}

function clearFail(phone) {
    const sql = `
        UPDATE account SET login_fail_num=0 WHERE phone=$1;
    `;
    return db.none(sql, [phone]);
}

async function verifyEmail(uuid) {
    const sql = `
        UPDATE account SET email_auth=true WHERE uuid=$1;
    `
    await db.none(sql, [uuid]);
    return updateActiveStatus(uuid);
}

function updateActiveStatus(uuid){
    const sql = `
    UPDATE account SET status=(
        CASE 
            WHEN email_auth=true AND status = 0 THEN 1
            ELSE status
        END
    )
    WHERE uuid=$1 AND status=0;
    `
    return db.none(sql, [uuid]);
}

function set_require_active_time(uuid, time) {
    const sql = `
        UPDATE account SET require_active_time=$2 WHERE uuid=$1;
    `
    return db.none(sql, [uuid, time]);
}

function get_user_total(filter, invalid) {
    const sql = `
        SELECT COUNT(*) FROM account 
        WHERE
            ${invalid != undefined ? `status=${invalid ? 2 : 1}` : "status >= 0"}
            ${filter != undefined ? `AND account LIKE '%'|| $1 ||'%'` : ""}; 
    `;
    return db.one(sql, [filter]);
}

function get_user(st, num, filter, invalid, uuid) {
    const sql = `
        SELECT *,account AS ac FROM account
        WHERE 
            ${invalid != undefined ? `status=${invalid ? 2 : 1}` : "status >= 0"}
            ${filter != undefined ? `AND account LIKE '%'|| $3 ||'%'` : ""}
            ${uuid != undefined ? `AND uuid = $4` : ""}
        ORDER BY account ASC
        LIMIT $2 OFFSET $1;
    `;
    return db.any(sql,[st, num, filter, uuid]);
}

async function delete_user_data(uuid) { 
    const sql = `
        DELETE FROM account WHERE uuid=$1;
    `
    // await dbp.delete_user_bird_data(uuid);
    return db.none(sql, [uuid])
}

function update_user(uuid, account, email, name, phone){
    const sql = `UPDATE account SET account=$2, email=$3, name=$4, phone=$5
                WHERE uuid=$1;`;
    return db.none(sql, [uuid, account,email, name, phone]);
}

module.exports = {
    query_account,
    query_account_email,
    new_account,
    update_password,
    set_admin,
    loginFail,
    clearFail,
    query_account_exist,
    verifyEmail,
    set_require_active_time,
    query_email_exist,
    get_user_total,
    get_user,
    delete_user_data,
    query_name_phone,
    query_uuid,
    update_user,
};
  