const jwt = require('jsonwebtoken');
const { SECRET } = require('../utils/config');
const { User } = require('../models');

// Middleware for tokens
const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
    } catch {
      return res.status(401).json({ error: 'token invalid' });
    }
  } else {
    return res.status(401).json({ error: 'token missing' });
  }

  next();
};

const userExtractor = async (req, res, next) => {
  if (req.decodedToken) {
    const user = await User.findByPk(req.decodedToken.id);
    if (user) {
      req.user = user;
    }
  }

  next();
};

module.exports = {
  tokenExtractor,
  userExtractor,
};
