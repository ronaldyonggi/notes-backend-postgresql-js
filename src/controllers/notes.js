const router = require('express').Router();
const { Op } = require('sequelize');
const { Note, User } = require('../models');
const middleware = require('../utils/middleware');

// Middleware for finding a specific note
const noteFinder = async (req, res, next) => {
  req.note = await Note.findByPk(req.params.id);
  next();
};

router.get('/', async (req, res) => {
  /**
   * Initially set the where object as empty. If the query for notes does not contain any additional param, then simply use this 'where' as empty
   */
  const where = {};

  /**
   * If our query contains a value for the important (e.g. http://localhost:3001/api/notes?important=true), then it'll reassign the 'important'
   * variable previously defined. Otherwise, the query would be run with the 'important' variable above, which includes both true and false
   */
  if (req.query.important) {
    where.important = req.query.important === 'true';
  }

  if (req.query.search) {
    /**
     * Query all notes which content includes the string specified in 'search' parameter. For example, http://localhost:3001/api/notes?search=adding&important=false
     * means to return all notes where the content includes the word 'adding'
     */
    where.content = {
      [Op.substring]: req.query.search,
    };
  }

  const notes = await Note.findAll({
    // Exclude userId in the response object
    attributes: { exclude: ['userId'] },
    // Include user.name in the response object
    include: {
      model: User,
      attributes: ['name'],
    },
    where,
  });
  // console.log(JSON.stringify(notes, null, 2))
  res.json(notes);
});

router.get('/:id', noteFinder, async (req, res) => {
  if (req.note) {
    res.json(req.note);
  } else {
    res.status(404).end();
  }
});

router.post('/', middleware.tokenExtractor, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'user not found' });
  }

  try {
    const note = await Note.create({
      ...req.body,
      userId: req.user.id,
      date: new Date(),
    });
    return res.json(note);
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Something wrong with adding a new note!' });
  }
});

router.put('/:id', noteFinder, async (req, res) => {
  if (req.note) {
    req.note.important = req.body.important;
    await req.note.save();
    res.json(req.note);
  } else {
    res.status(404).end();
  }
});

router.delete('/:id', noteFinder, async (req, res) => {
  if (req.note) {
    await req.note.destroy();
    res.status(204).end();
  } else {
    res.status(400).end();
  }
});

module.exports = router;
