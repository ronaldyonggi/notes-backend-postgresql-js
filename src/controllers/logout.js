const { getAsync, delAsync } = require('../utils/redis');

const router = require('express').Router();

router.delete('/', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'user not found' });
  }

  // Get token associated with the currently logged in user from redis
  const tokenInRedis = await getAsync(String(req.user.id));
  await delAsync(String(req.user.id));
  await delAsync(String(tokenInRedis));

  return res.status(200).json({ success: true });
});

module.exports = router;
