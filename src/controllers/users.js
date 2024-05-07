const router = require('express').Router();
const middleware = require('../utils/middleware');

const { User, Note, Team } = require('../models');

const isAdmin = async (req, res, next) => {
  const user = await User.findByPk(req.decoded.id);
  if (!user.admin) {
    return res.status(401).json({ error: 'operation not allowed' });
  }

  next();
};

// GET all users
router.get('/', async (req, res) => {
  // GET admins only
  if (req.query.admin === 'true') {
    const adminUsers = await User.scope('admin').findAll();
    return res.json(adminUsers);
  }

  // GET all disabled users only
  if (req.query.disabled === 'true') {
    const disabledUsers = await User.scope('disabled').findAll();
    return res.json(disabledUsers);
  }

  // GET all users whose name contain the string specified
  if (req.query.name) {
    const nameQuery = req.query.name;
    const filteredByName = await User.scope({
      method: ['name', `%${nameQuery}%`],
    }).findAll();
    return res.json(filteredByName);
  }

  const users = await User.findAll({
    include: [
      {
        model: Note,
        attributes: { exclude: ['userId'] },
      },
      {
        model: Team,
        attributes: ['name', 'id'],
        through: {
          attributes: [],
        },
      },
    ],
  });
  res.json(users);
});

// CREATE a user
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    return res.json(user);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

// GET a specific user
router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: [''] },
    include: [
      {
        model: Note,
        attributes: { exclude: ['userId'] },
      },
      {
        model: Note,
        as: 'marked_notes',
        attributes: { exclude: ['userId'] },
        through: {
          attributes: [],
        },
        include: {
          model: User,
          attributes: ['name'],
        },
      },
      // {
      //   model: Team,
      //   attributes: ['name', 'id'],
      //   through: {
      //     attributes: [],
      //   },
      // },
    ],
  });

  if (!user) {
    return res.status(404).json({ error: 'user not found!' });
  }

  let teams = undefined;
  if (req.query.teams) {
    teams = await user.getTeams({
      attributes: ['name'],
      joinTableAttributes: [],
    });
  }

  res.json({
    ...user.toJSON(),
    teams,
  });
});

// Change the status of a user's account. This endpoint can only be used by admins
router.put(
  '/:username',
  middleware.tokenExtractor,
  isAdmin,
  async (req, res) => {
    const user = await User.findOne({
      where: {
        username: req.params.username,
      },
    });

    if (user) {
      user.disabled = req.body.disabled;
      await user.save();
      res.json(user);
    } else {
      res.status(404).end();
    }
  }
);

module.exports = router;
