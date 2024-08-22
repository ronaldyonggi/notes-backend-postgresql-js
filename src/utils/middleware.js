const jwt = require('jsonwebtoken');
const { SECRET } = require('../utils/config');
const { User } = require('../models');
const { getAsync } = require('./redis');

// Middleware for tokens
const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const tokenBeforeDecoded = authorization.substring(7); // fetch the token part after 'bearer '
      // fetch the user id associated with the token from redis
      const userIdInRedis = await getAsync(String(tokenBeforeDecoded));
      // If token exists in redis, proceed
      if (userIdInRedis) {
        req.decodedToken = jwt.verify(tokenBeforeDecoded, SECRET);
      }
    } catch {
      return res.status(401).json({ error: 'token invalid' });
    }
  }
  // else {
  //   return res.status(401).json({ error: 'token missing' });
  // }

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
