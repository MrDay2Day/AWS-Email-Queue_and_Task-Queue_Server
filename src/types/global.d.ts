export {};

declare global {
  namespace NodeJS {
    /**
     * All the required environment variables for the server application
     */
    interface ProcessEnv {
      NODE_ENV: string;
      APP_NAME: string;
      PORT: string;
      LOCAL_URL: string;
      JWT_TOKEN_EXPIRE: string;
      SALT: string;
      APP_CONTAINER_NAME: string;
      PM2_CLUSTER_SIZE: string;
      // Socket Management
      APP_SOCKET_NAME: string;
      APP_MAIN_SOCKET_ROOM: string;
      // File Management
      FILE_UP_DOWN: string;
      FILE_TYPES: string;
      IMAGES_ONLY: string;
      // Redis Server
      USE_REDIS: string;
      REDIS_URL: string;
      REDIS_HOST: string;
      REDIS_PORT: string;
      REDIS_PASS: string;
      //MongoDB
      MONGO_ACTIVE: string;
      MONGO_USE_INTERNAL_SERVER: string;
      MONGO_USE_REPLICA_SET: string;
      MONGO_REPLICA_SET_1: string;
      MONGO_URL: string;
      MONGO_CLUSTER: string;
      MONGO_USER: string;
      MONGO_PASSWORD: string;
      MONGO_DEFAULT_DATABASE: string;
      ADMIN_DEFAULT_DATABASE: string;
      // PostGres SQL
      PG_ACTIVE: string;
      PG_USER: string;
      PG_HOST: string;
      PG_DB: string;
      PS_PASS: string;
      PG_PORT: string;
      // MySQL
      MYSQL_ACTIVE: string;
      MYSQL_USER: string;
      MYSQL_HOST: string;
      MYSQL_DB: string;
      MYSQL_PASS: string;
      MYSQL_PORT: string;
      // AWS SES Service
      EMAIL_SENDING_ADDRESS: string;
      EMAIL_SHORT_NAME: string;
      AWS_REGION: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_SES_SEND_LIMIT_PER_SEC: string;
      AWS_SES_QUEUE_WAIT_TIME: string;
      // Backblaze S3 Storage
      BACKBLAZE_PUBLIC_KEY_ID: string;
      BACKBLAZE_PUBLIC_KEY: string;
      BACKBLAZE_PRIVATE_KEY_ID: string;
      BACKBLAZE_PRIVATE_KEY_NAME: string;
      BACKBLAZE_PRIVATE_BUCKET_NAME: string;
      BACKBLAZE_PRIVATE_KEY: string;
    }
  }
}
