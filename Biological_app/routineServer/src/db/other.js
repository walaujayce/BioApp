require('dotenv').config();
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

function getNotCheckData() {
	const sql = `
        SELECT COUNT(*) FROM bird WHERE upload=false;
    `;
	return db.one(sql);
}

module.exports = {
	getNotCheckData,
}