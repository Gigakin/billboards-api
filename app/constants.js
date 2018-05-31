// Constants
module.exports = {
  DB: {
    HOST: process.env.DB_HOST || "localhost",
    USER: process.env.DB_USER || "root",
    PASSWORD: process.env.DB_PASSWORD || "password",
    DBNAME: process.env.DB_NAME || "lk-billboards"
  }
};
