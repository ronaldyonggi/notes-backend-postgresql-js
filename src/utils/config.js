require('dotenv').config()

const PORT = process.env.PORT || 3001
const DATABASE_URL = process.env.DATABASE_URL

module.exports = {
  DATABASE_URL,
  PORT
}