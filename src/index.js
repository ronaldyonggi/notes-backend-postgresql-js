const cors = require('cors')
const express = require('express')
const app = express()

const { connectToDatabase } = require('./utils/db')
const notesRouter = require('./controllers/notes')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const { PORT } = require('./utils/config')
const middleware = require('./utils/middleware')

app.use(cors())
app.use(express.json())
app.use(middleware.tokenExtractor)

app.use('/api/notes', middleware.userExtractor, notesRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

const start = async () => {
  await connectToDatabase()
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

start()