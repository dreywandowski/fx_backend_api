import configuration from 'src/config/configuration';
import { DataSource, DataSourceOptions } from 'typeorm';

const config = configuration();
export const dbDataSource: DataSourceOptions = {
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  entities: ['dist/**/**/*.entity.{js,ts}'],
  migrations: ['dist/migrations/*.{js,ts}'],
  migrationsTableName: 'migrations',
  synchronize: false,
};

const dataSource = new DataSource(dbDataSource);

export default dataSource;
