const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS ? '[set]' : '[empty]');
console.log('DB_HOST:', process.env.DB_HOST);

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
const isAivenHost = (process.env.DB_HOST || '').endsWith('.aivencloud.com');
const dbPort = process.env.DB_PORT
  ? Number(process.env.DB_PORT)
  : (isAivenHost ? 26506 : 3306);
const useSsl = process.env.DB_SSL
  ? process.env.DB_SSL === 'true'
  : isAivenHost || Boolean(databaseUrl);

console.log('DB_PORT:', databaseUrl ? '[from connection URL]' : dbPort);
console.log('DB_SSL:', useSsl);

const connectionOptions = {
  dialect: 'mysql',
  dialectOptions: useSsl
    ? { ssl: { rejectUnauthorized: false } }
    : {},
  connectTimeout: 10000,
  logging: false,
};

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, connectionOptions)
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      { ...connectionOptions, host: process.env.DB_HOST, port: dbPort }
    );

module.exports = sequelize;
