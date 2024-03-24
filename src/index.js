const express = require('express')
const app = express()

const { connectToDatabase } = require('./utils/db')
const notesRouter = require('./controllers/notes')
const { PORT } = require('./utils/config')

app.use(express.json())
app.use('/api/notes', notesRouter)

const start = async () => {
  await connectToDatabase()
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

start()