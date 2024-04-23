const { Sequelize } = require('sequelize');
const config = require('./config');
const { Umzug, SequelizeStorage } = require('umzug');
// const { logger } = require('sequelize/lib/utils/logger');

const sequelize = new Sequelize(config.DATABASE_URL);

// const runMigrations = async () => {
//   const migrator = new Umzug({
//     migrations: {
//       glob: 'migrations/*.js',
//     },
//     storage: new SequelizeStorage({
//       sequelize,
//       tableName: 'migrations',
//     }),
//     context: sequelize.getQueryInterface(),
//     logger: console,
//   });

//   const migrations = await migrator.up();
//   console.log('Migrations up to date', {
//     files: migrations.map((mig) => mig.name),
//   });
// };

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

const migrationConf = {
  migrations: {
    glob: 'migrations/*.js',
  },
  storage: new SequelizeStorage({
    sequelize,
    tableName: 'migrations',
  }),
  context: sequelize.getQueryInterface(),
  logger: console,
};

const runMigrations = async () => {
  const migrator = new Umzug(migrationConf);
  const migrations = await migrator.up();
  console.log('Migrations up to date', {
    files: migrations.map((mig) => mig.name),
  });
};

const rollbackMigration = async () => {
  await sequelize.authenticate();
  const migrator = new Umzug(migrationConf);
  await migrator.down();
};

module.exports = {
  connectToDatabase,
  sequelize,
  rollbackMigration,
};
