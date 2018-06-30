// Constants
module.exports = {
  BASE_URL: process.env.LK_BB_SERVER_URL,
  DB: {
    HOST: process.env.LK_BB_DB_HOST,
    USER: process.env.LK_BB_DB_USER,
    PASSWORD: process.env.LK_BB_DB_PASSWORD,
    DBNAME: process.env.LK_BB_DB_NAME
  },
  JWT: {
    SECRET_KEY: process.env.LK_BB_JWT_SECRET_KEY
  }
};
