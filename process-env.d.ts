declare namespace NodeJS {
  interface ProcessEnv {
    // PostgreSQL Database Configuration
    DATABASE_URL: string;
    DB_HOST: string;
    DB_PORT: string;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
    
    // Next.js environment
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
