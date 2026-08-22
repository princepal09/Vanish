import dotenv from 'dotenv'

dotenv.config();


export const CLIENT_URL=process.env.CLIENT_URL as string
export const PORT = process.env.PORT || 8000
