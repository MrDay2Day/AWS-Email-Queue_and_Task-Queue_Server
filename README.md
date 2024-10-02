<div style="max-width: 600px; margin-right: auto; margin-left: auto;">

# Task Queue & AWS Email Queue Server

Queue all you task with an expiration date & time with a return API to notify your services when a task has expired.

Queue all your emails for all your services in one place to send using `Amazon Web Service - Simple Emailing Service` `(AWS-SES)`. Set your send rate according to your `AWS-SES` account, upload your `html` templates also send attachments.

## Setup

You can start this serve via `TypeScript`, `NodeJs` or `Docker`.

### Environment Variables

The environment variables are required:

| Variable                   | Default Value              | Description                               |
| -------------------------- | -------------------------- | ----------------------------------------- |
| ADMIN_API_KEY              | -                          | This API Key is used to do admin actions. |
| PORT                       | 3852                       | Port for server.                          |
| NODE_ENV                   | dev                        | dev = Development else leave blank.       |
| NODE_VERSION               | node:22.6                  | Node Version for dockerr.                 |
| APP_NAME                   | Day2Day Email/Queue Server | Application name.                         |
| APP_CONTAINER_NAME         | d2d_email_queue            | Docker container name                     |
| MAX_UPLOAD_SIZE            | 25                         | Max upload size for server per request.   |
| AWS_REGION                 | -                          | AWS SMTP Settings.                        |
| AWS_ACCESS_KEY_ID          | -                          | AWS SMTP Settings.                        |
| AWS_SECRET_ACCESS_KEY      | -                          | AWS SMTP Settings.                        |
| AWS_SES_SEND_LIMIT_PER_SEC | 10                         | 10 emails pre second.                     |
| AWS_SES_QUEUE_WAIT_TIME    | 1000                       | Cool down period before send next set.    |
| MYSQL_HOST                 | server-mysql               | Default for docker.                       |
| MYSQL_USER                 | root                       | Default for docker.                       |
| MYSQL_PASS                 | root_password              | Default for docker.                       |
| MYSQL_PORT                 | 3959                       | Default for docker.                       |
| MYSQL_DB                   | d2d_email_queue            | Default for docker.                       |

## Development

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

### TypeScript

Using your local system using:

**Step 1** - Continuos integration

```bash
npm ci
```

**Step 2** - This execute the server using `ts-nod-dev`

```bash
npm run ts-dev
```

### NodeJs

Using your local system compiling `TypeScript` in watch mode to `Javascript` and then listen for changes with `nodemon`:

**Step 1** - Continuos integration

```bash
npm ci
```

**Step 2** - This execute the server using `ts-nod-dev`

```bash
npm run dev
```

---

If there are any issues with starting the development server try:

```bash
npx tsc
```

then:

```bash
npn run dev
```

### Docker

Using your local system using:

Using `ts-node-dev`

```bash
./app.sh docker-dev
```

Compiling `TypeScript` in watch mode to `Javascript`

```bash
./app.sh docker-dev-node
```

</div>

## Deployment

Ensure that `NODE_ENV` is commented out or blank.

_NB: Docker deployment is recommended for deployment._

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

### TypeScript

Using your local system using:

**Step 1** - Continuos integration

```bash
npm ci
```

**Step 2** - This execute the server using `ts-nod-dev`

```bash
npm run ts
```

### NodeJs

Using your local system compiling `TypeScript` in watch mode to `Javascript` and then listen for changes with `nodemon`:

**Step 1** - Continuos integration

```bash
npm ci
```

**Step 2** - This execute the server using `ts-nod-dev`

```bash
npm run start
```

---

If there are any issues with starting the development server try:

```bash
npx tsc
```

then:

```bash
npn run start
```

### Docker

This containers uses `ts-node`

```bash
./app.sh docker-prod
```

</div>

</div>
