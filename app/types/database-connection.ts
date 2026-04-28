// Database connection types for multi-database support

export type DatabaseType = 
  | 'oracle'
  | 'mysql'
  | 'postgresql'
  | 'sqlite'
  | 'sqlserver'
  | 'mongodb';

export interface DatabaseInfo {
  id: DatabaseType;
  name: string;
  icon: string;
  defaultPort: string;
  description: string;
  color: string;
}

export interface BaseConnectionConfig {
  type: DatabaseType;
  name?: string; // Optional connection name
}

export interface OracleConnectionConfig extends BaseConnectionConfig {
  type: 'oracle';
  host: string;
  port: string;
  serviceName: string;
  username: string;
  password: string;
}

export interface MySQLConnectionConfig extends BaseConnectionConfig {
  type: 'mysql';
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export interface PostgreSQLConnectionConfig extends BaseConnectionConfig {
  type: 'postgresql';
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  schema?: string;
  ssl?: boolean;
}

export interface SQLiteConnectionConfig extends BaseConnectionConfig {
  type: 'sqlite';
  filePath: string;
}

export interface SQLServerConnectionConfig extends BaseConnectionConfig {
  type: 'sqlserver';
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  instance?: string;
  encrypt?: boolean;
}

export interface MongoDBConnectionConfig extends BaseConnectionConfig {
  type: 'mongodb';
  host: string;
  port: string;
  database: string;
  username?: string;
  password?: string;
  authDatabase?: string;
  ssl?: boolean;
}

export type DatabaseConnectionConfig =
  | OracleConnectionConfig
  | MySQLConnectionConfig
  | PostgreSQLConnectionConfig
  | SQLiteConnectionConfig
  | SQLServerConnectionConfig
  | MongoDBConnectionConfig;

export const DATABASE_TYPES: DatabaseInfo[] = [
  {
    id: 'oracle',
    name: 'Oracle',
    icon: '🔶',
    defaultPort: '1521',
    description: 'Oracle Database',
    color: 'bg-red-500',
  },
  {
    id: 'mysql',
    name: 'MySQL',
    icon: '🐬',
    defaultPort: '3306',
    description: 'MySQL Database',
    color: 'bg-blue-500',
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    icon: '🐘',
    defaultPort: '5432',
    description: 'PostgreSQL Database',
    color: 'bg-indigo-600',
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    icon: '🪶',
    defaultPort: '',
    description: 'SQLite File Database',
    color: 'bg-teal-500',
  },
  {
    id: 'sqlserver',
    name: 'SQL Server',
    icon: '🗄️',
    defaultPort: '1433',
    description: 'Microsoft SQL Server',
    color: 'bg-gray-600',
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    icon: '🍃',
    defaultPort: '27017',
    description: 'MongoDB NoSQL Database',
    color: 'bg-green-600',
  },
];
