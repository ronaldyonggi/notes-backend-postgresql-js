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

router.get('/', async (req, res) => {
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

router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    return res.json(user);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    include: {
      model: Note,
    },
  });

  if (user) {

    const objectToBeReturned = {
      username: user.username,
      name: user.name,
      note_count: user.notes.length,
    };

    res.json(objectToBeReturned);
  } else {
    res.status(404).end();
  }
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
