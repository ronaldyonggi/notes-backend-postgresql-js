const router = require('express').Router();

const { User, Note } = require('../models');

const isAdmin = async (req, res, next) => {
  const user = await User.findByPk(req.decoded.id);
  if (!user.admin) {
    return res.status(401).json({ error: 'operation not allowed' });
  }

  next();
};

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Note,
      attributes: { exclude: ['userId'] },
    },
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
  const user = await User.findByPk(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).end();
  }
});

module.exports = router;
