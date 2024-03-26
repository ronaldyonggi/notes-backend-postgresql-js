const router = require('express').Router()
const { Note, User } = require('../models')

// Middleware for finding a specific note
const noteFinder = async (req, res, next) => {
  req.note = await Note.findByPk(req.params.id)
  next()
}

router.get('/', async (req, res) => {
  const notes = await Note.findAll()
  console.log(JSON.stringify(notes, null, 2))
  res.json(notes)
})

router.get('/:id', noteFinder, async (req, res) => {
  if (req.note) {
    res.json(req.note)
  } else {
    res.status(404).end()
  }
})

router.post('/', async (req, res) => {
  try {
    const user = await User.findOne()
    const note = await Note.create({
      ...req.body,
      userId: user.id
    })
    return res.json(note)
  } catch(error) {
    return res.status(400).json({ error })
  }
})

router.put('/:id', noteFinder, async (req, res) => {
  if (req.note) {
    req.note.important = req.body.important
    await req.note.save()
    res.json(req.note)
  } else {
    res.status(404).end()
  }
})

router.delete('/:id', noteFinder, async (req, res) => {
  if (req.note) {
    await req.note.destroy()
    res.status(204).end()
  } else {
    res.status(400).end()
  }
})

module.exports = router