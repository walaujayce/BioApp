require('./post.js');
const pgp = require('pg-promise')();
const db = pgp(process.env.DB_URL);
const saltedSha256 = require('salted-sha256');
// account status{
//   0:inactive,
//   1:active,
//   2:invalid 
// } 
// require_active_time: User require active email cool time
// require_change_time: User require change password cool time
// ban_time: Fail login cool time
// blocked_time: Invalid user block_time
const schemaSql = `
    -- Extensions
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Drop (droppable only when no dependency)
    DROP TABLE IF EXISTS bird;
    DROP TABLE IF EXISTS account;
    DROP TABLE IF EXISTS session;

    DROP INDEX IF EXISTS IDX_session_expire;
    DROP INDEX IF EXISTS IDX_account;

    -- Create    
    CREATE TABLE account(
        uuid uuid NOT NULL DEFAULT uuid_generate_v4(),
        account text UNIQUE NOT NULL ,
        name text NOT NULL,
        password text NOT NULL,
        salt text NOT NULL DEFAULT '123456789',
        email text UNIQUE NOT NULL,
        phone text UNIQUE NOT NULL,
        money integer NOT NULL DEFAULT 0,
        admin bool NOT NULL DEFAULT false,
        email_auth bool NOT NULL DEFAULT false,
        invalid_num integer NOT NULL DEFAULT 0,
        login_fail_num integer NOT NULL DEFAULT 0,
        ban_time bigint NOT NULL DEFAULT 0,
        blocked_time bigint NOT NULL DEFAULT 0,
        status integer NOT NULL DEFAULT 0,
        require_active_time bigint NOT NULL DEFAULT 0,
        require_change_time bigint NOT NULL DEFAULT 0,
        PRIMARY KEY (uuid)
    );

    CREATE TABLE bird(
      id              serial PRIMARY KEY NOT NULL,
      name            text ,
      description     text ,
      photo           text NOT NULL,
      lon             float8 NOT NULL DEFAULT 0,
      lat             float8 NOT NULL DEFAULT 0,
      creator         text NOT NULL,
      upload          bool NOT NULL DEFAULT false,
      hash            text ,
      time            bigint NOT NULL DEFAULT extract(epoch from now()),
      invalid         bool NOT NULL DEFAULT false,
      account_id      uuid NOT NULL,
      CONSTRAINT account_id_key FOREIGN KEY(account_id) REFERENCES account(uuid) ON DELETE CASCADE
    );

    CREATE INDEX "IDX_account" ON "account" ("account");

    CREATE TABLE "session" (
            "sid" varchar NOT NULL COLLATE "default",
            "sess" json NOT NULL,
            "expire" timestamp(6) NOT NULL
      )
      WITH (OIDS=FALSE);
      
    ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
      
    CREATE INDEX "IDX_session_expire" ON "session" ("expire");
    
`;
const grorge_passwd = saltedSha256('grorge', '123');
const admin_passwd = saltedSha256('admin', '123');
const userSql = `
  INSERT INTO account(account, password, salt, money, admin, email, status, phone, name) VALUES('grorge', '${grorge_passwd}', '123', '10000','false', 'abc@abc2.com', 1, '+886900000002', 'grorge');
  INSERT INTO account(account, password, salt, money, admin, email, status, blocked_time, phone, name) VALUES('Grorge123', '${grorge_passwd}', '123', '10000','false', 'abc@abc3.com', 2, ${Date.now()}, '+886900000001', 'Grorge123');
`;
const adminSql = `
  INSERT INTO account(account, password, salt, money, admin, email, status, phone, name) VALUES('admin', '${admin_passwd}', '123', '10000','true', 'abc@abc1.com', 1, 'admin', 'admin') RETURNING uuid;
`
// console.log(grorge_passwd, admin_passwd, dataSql)
db.none(schemaSql)
  .then(() => {
    console.log('Schema created');
    db.none(userSql).then(()=>{
      db.one(adminSql).then((uuid) => {
        const dataSql = `
          INSERT INTO bird(name, description, photo, creator, account_id) VALUES('test', 'test', 'no url', 'admin', '${uuid.uuid}');
        `
        db.none(dataSql).then(()=>{
          console.log('Data populated');
          pgp.end();
        });
      });
    });  
  })
  .catch((err) => {
    console.log('Error creating schema', err);
  });
