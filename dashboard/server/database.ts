import mysql from 'mysql2/promise';

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

const config: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'v_o_c_e',
  port: parseInt(process.env.DB_PORT || '3306')
};

class Database {
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      ...config,
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
      charset: 'utf8mb4'
    });

    this.initialize();
  }

  private async initialize() {
    try {
      const connection = await this.pool.getConnection();
      console.log('✅ Conectado ao banco de dados MariaDB');
      connection.release();
    } catch (error) {
      console.error('❌ Erro ao conectar com o banco de dados:', error);
      throw error;
    }
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Erro na query:', error);
      throw error;
    }
  }

  async getConnection() {
    return await this.pool.getConnection();
  }

  async close() {
    await this.pool.end();
  }
}

export const db = new Database();
