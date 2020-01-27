require('dotenv').config()

const pgp = require('pg-promise')()
const path = require('path')

var types = pgp.pg.types;
types.setTypeParser(1114, str => str);

const db = pgp({
  user: "postgres",//process.env.PGUSER,
  password: "1likepants", //process.env.PGPASSWORD,
  host: "localhost", //process.env.PGHOST,
  port: 5432,
  database: "chain", //process.env.PGDATABASE,
  ssl: false
});

function sql(file) {
  const fullPath = path.join(__dirname, '../sql/'+file);
  return new pgp.QueryFile(fullPath, { minify: true });
}

export { db, sql, pgp }
