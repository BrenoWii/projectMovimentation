module.exports = {
  type: process.env.DB_TYPE || 'postgres',
  host: process.env.DB_HOST || 'host.docker.internal',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'fluxodecaixa',
  entities: ['dist/**/*.entity.js'],
  synchronize: false,
  migrations: ['dist/migrations/*.js'],
};
