const { Sequelize } = require('sequelize');
const config = require('./config');
const { Umzug, SequelizeStorage } = require('umzug');

const sequelize = new Sequelize(config.DATABASE_URL);

const runMigrations = async () => {
  const migrator = new Umzug({
    migrations: {
      glob: 'migrations/*.js',
    },
    storage: new SequelizeStorage({
      sequelize,
      tableName: 'migrations',
    }),
    context: sequelize.getQueryInterface(),
    logger: console,
  });

  const migrations = await migrator.up();
  console.log('Migrations up to date', {
    files: migrations.map((mig) => mig.name),
  });
};

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    await runMigrations();
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
