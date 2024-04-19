const { Sequelize } = require('sequelize');
const config = require('./config');
const sequelize = new Sequelize(config.DATABASE_URL);

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
  } catch (error) {
    console.log('Failed to connect to DB!');
    return process.exit(1);
  }

  return null;
};

module.exports = {
  connectToDatabase,
  sequelize,
};
