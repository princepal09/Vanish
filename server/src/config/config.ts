import dotenv from 'dotenv'

dotenv.config();


export const CLIENT_URL=process.env.CLIENT_URL as string
export const PORT = process.env.PORT || 8000
export const DB_USER = process.env.DB_USER
export const DB_PASSWORD = process.env.DB_PASSWORD
export const DB_SERVER =process.env.DB_SERVER
export const DB_DATABASE= process.env.DB_DATABASE
export const DB_INSTANCE =process.env.DB_INSTANCE
export const DB_ENCRYPT =process.env.DB_ENCRYPT
export const DB_TRUST_SERVER_CERTIFICATE = process.env.DB_TRUST_SERVER_CERTIFICATE
