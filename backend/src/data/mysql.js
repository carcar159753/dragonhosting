import mysql from 'mysql2/promise';

let pool;

export function getMysqlPool() {
  if (!process.env.MYSQL_HOST) {
    return null;
  }

  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      connectionLimit: 10,
    });
  }

  return pool;
}
