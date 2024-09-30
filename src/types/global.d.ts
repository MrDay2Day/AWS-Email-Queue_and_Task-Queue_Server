export {};

declare global {
  namespace NodeJS {
    /**
     * All the required environment variables for the server application
     */
    interface ProcessEnv {
      ADMIN_API_KEY: string;
      //
      NODE_ENV: string;
      APP_NAME: string;
      PORT: string;
      LOCAL_URL: string;
      APP_CONTAINER_NAME: string;
      PM2_CLUSTER_SIZE: string;
      MAX_UPLOAD_SIZE: string;
      // MySQL
      MYSQL_USER: string;
      MYSQL_HOST: string;
      MYSQL_DB: string;
      MYSQL_PASS: string;
      MYSQL_PORT: string;
      // AWS SES Service
      AWS_REGION: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_SES_SEND_LIMIT_PER_SEC: string;
      AWS_SES_QUEUE_WAIT_TIME: string;
    }
  }
}
