import sql from "mssql";

import {
  DB_DATABASE,
  DB_ENCRYPT,
  DB_INSTANCE,
  DB_PASSWORD,
  DB_SERVER,
  DB_TRUST_SERVER_CERTIFICATE,
  DB_USER,
} from "./config.js";

const dbConfig: sql.config = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  server: DB_SERVER || "localhost",

  options: {
    instanceName: DB_INSTANCE,
    encrypt: DB_ENCRYPT === "true",
    trustServerCertificate:
      DB_TRUST_SERVER_CERTIFICATE === "true",
  },

  connectionTimeout: 30000,
};

let pool: sql.ConnectionPool | null = null;

export const connectDB = async (): Promise<sql.ConnectionPool> => {
  if (pool) {
    return pool;
  }

  try {
    pool = await sql.connect(dbConfig);

    console.log("Connected to SQL Server");

    return pool;
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
};

export default sql;