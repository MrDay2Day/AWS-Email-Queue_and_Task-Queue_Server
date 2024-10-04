<div style="max-width: 600px; margin-right: auto; margin-left: auto;">

# Task Queue & AWS Email Queue Server

Task Queue with Expiration and Notification API. This microservice allows you to queue tasks with an expiration date and time. It monitors these tasks and triggers a callback to your designated API once a task has expired, ensuring that your services are notified in real-time when deadlines are missed or tasks require follow-up. The expiration logic is fully customizable to meet your workflow needs, allowing seamless integration with your existing systems.

Centralized Email Queue with `AWS-SES` Integration. This microservice enables centralized management of email queues across multiple services. It integrates with Amazon Web Services' Simple Email Service (`AWS-SES`) to handle all email-sending operations. Features include the ability to configure send rates based on your `AWS-SES` account limits, upload and manage `HTML` templates, and send emails with attachments. This service optimizes email delivery performance and ensures compliance with your account's rate limits, providing a scalable solution for high-volume email dispatch.

Both components work together to streamline task management and email delivery, offering robust and efficient handling of time-sensitive tasks and communication across your services.

## Setup

You can start these serve via `TypeScript` using `ts-node`, `NodeJs` Compiled `TypeScript` to `JavaScript` or `Docker` for the quickest deployment.

**IMPORTANT ACTION**

**Copy `.env.template` to `.env`.**

```bash
cp .env.template .env
```

### Environment Variables

| Variable                   | Default Value              | Description                               |
| -------------------------- | -------------------------- | ----------------------------------------- |
| ADMIN_API_KEY              | -                          | This API Key is used to do admin actions. |
| PORT                       | 3852                       | Port for server.                          |
| NODE_ENV                   | dev                        | dev = Development else leave blank.       |
| NODE_VERSION               | node:22.6                  | Node Version for docker.                  |
| APP_NAME                   | Day2Day Email/Queue Server | Application name.                         |
| APP_CONTAINER_NAME         | d2d_email_queue            | Docker container name                     |
| MAX_UPLOAD_SIZE            | 25                         | Max upload size for server per request.   |
| AWS_REGION                 | -                          | AWS SMTP Settings.                        |
| AWS_ACCESS_KEY_ID          | -                          | AWS SMTP Settings.                        |
| AWS_SECRET_ACCESS_KEY      | -                          | AWS SMTP Settings.                        |
| AWS_SES_SEND_LIMIT_PER_SEC | 10                         | 10 emails pre second.                     |
| AWS_SES_QUEUE_WAIT_TIME    | 1000                       | Cool down period before next batch.       |
| MYSQL_HOST                 | server-mysql               | Default for docker.                       |
| MYSQL_USER                 | root                       | Default for docker.                       |
| MYSQL_PASS                 | root_password              | Default for docker.                       |
| MYSQL_PORT                 | 3959                       | Default for docker.                       |
| MYSQL_DB                   | d2d_email_queue            | Default for docker.                       |

<br/>
<br/>
<br/>

# Development

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

### TypeScript

Using your local system using:

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

**Step 1** - Continuos integration

```bash
npm ci
```

**Step 2** - This execute the server using `ts-nod-dev`

```bash
npm run ts-dev
```

</div>

### NodeJs

Using your local system compiling `TypeScript` in watch mode to `Javascript` and then listen for changes with `nodemon`:

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

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

</div>

### Docker

Using your local system using:

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

Using `ts-node-dev`

```bash
./app.sh docker-dev
```

Compiling `TypeScript` in watch mode to `Javascript`

```bash
./app.sh docker-dev-node
```

</div>

</div>
<br/>
<br/>
<br/>

# Deployment

Ensure that `NODE_ENV` is commented out or blank.

_NB: Docker deployment is recommended for deployment._

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

### TypeScript

Using your local system using:

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

**Step 1** - Continuos integration

```bash
npm ci
```

**Step 2** - This execute the server using `ts-nod-dev`

```bash
npm run ts
```

</div>

### NodeJs

Using your local system compiling `TypeScript` in watch mode to `Javascript` and then listen for changes with `nodemon`:

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

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

</div>

### Docker

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

This containers uses `ts-node`

```bash
./app.sh docker-prod
```

</div>

</div>

<br/>
<br/>
<br/>

<!--  -->

# API Keys

API Keys are managed using the `ADMIN_API_KEY` as `Bearer` Token in the `Authorization` Header.

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

## Managing API Keys

### Create API Key

Send a `POST` request to the Email/Queue Server

`{{SERVER}}/server/api/create`

Required:

| Field      | Description                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| api_name   | Name of API Key must be unique                                                                         |
| return_api | API return route for this API key                                                                      |
| temporary  | `false` will disable duration of api_key                                                               |
| duration   | How long the API key should last for. Max 10 years **NOTE:** _Only required if `temporary` is `true`._ |

<br/>

**Request 1** - Without out expiry date.

```json
{
  "api_name": "task_tracker_api_1",
  "return_api": "http://api.server.com/task-tracking-1",
  "temporary": false
}
```

**Response 1**

```json
{
  "api_name": "task_tracker_api_1",
  "api_key": "9RkN1-fI6hfMclMNX4_Q6YahWBc.rIoMlBnRP34cYE30X76r",
  "return_api": "http://api.server.com/task-tracking-1",
  "expire_date": null,
  "valid": true
}
```

**Request 2** - With expiry date of 4 days

```json
{
  "api_name": "task_tracker_api_2",
  "return_api": "http://api.server.com/task-tracking-2",
  "temporary": true,
  "duration": "4d" // m=minutes | h=hours | d=days | M=months | y=years
}
```

**Response 2**

```json
{
  "api_name": "task_tracker_api_2",
  "api_key": "qA5Bz-rly3vMUccmHP_mLW25Xjf.SpXIflHVcg4RF5XJ8MTv",
  "return_api": "http://api.server.com/task-tracking-2",
  "expire_date": "2024-10-07T18:13:03.000Z",
  "valid": true
}
```

### Delete API Key

To delete and API Key send a `POST` request with either `api_name` or `api_key` to the Email/Queue Server

`{{SERVER}}/server/api/delete`

| Field    | Description     |
| -------- | --------------- |
| api_name | Name of API Key |
| api_key  | API key         |

<br/>

**Request**

```json
{
  "api_name": "task_tracker_api_1"
}
```

or

```json
{
  "api_key": "9RkN1-fI6hfMclMNX4_Q6YahWBc.rIoMlBnRP34cYE30X76r"
}
```

**Response**

If the request is successful `valid` will be `true` else `false` with a error message `msg`.

```JSON
{
    "valid": true
}
```

</div>

<br/>
<br/>
<br/>

# Email Queue

The Email Queue uses AWS-SES to send raw emails - that is HTML and Buffer for attachments.

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

## Email Templates

Email Templates are managed using the `ADMIN_API_KEY` as `Bearer` Token in the `Authorization` Header.

Email Templates should be a single HTML file with templates variables between `{{-` `VARIABLE` `-}}`. This file will be stored on the server, max size `500kb`.

Example:

```html
...
<div style="font-size: 14px; line-height: 140%; word-wrap: break-word;">
  <p style="line-height: 140%;">Dear {{-NAME-}},</p>
  <p style="line-height: 140%;"> </p>
  <p style="line-height: 140%;">
    You account balance is ready for {{-BALANCE-}} a/c {{-ACCOUNT-}}. You
    balance is due {{-DATE-}}. If you have any issues making your payment please
    email us at {{-SUPPORT_EMAIL-}}.
  </p>
  <p style="line-height: 140%;"> </p>
  <p style="line-height: 140%;">Thank you</p>
  <p style="line-height: 140%;">Managment.</p>
</div>
...
```

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

### Adding a template

Make a `FormData` `POST` request to the Email/Queue Server with just the file. The filename of the html file will also be the template name.

`{{SERVER}}/server/email/add-template`

Eg: If the file name is `welcome-email.html` then the template name is `welcome-email`.

| Key  | Type        | Value              |
| ---- | ----------- | ------------------ |
| html | file/buffer | welcome-email.html |

What the server expects to see:

```bash
{
  fieldname: 'html',
  originalname: 'welcome-email.html',
  encoding: '7bit',
  mimetype: 'text/html',
  buffer: <Buffer 3c 21 44 ... 8390 more bytes>,
  size: 8440
}
```

### Viewing all templates

You are able to see all templates stored on your server by sending a `POST` request, because this server can be used as a microservice for multiple applications and services depending on your server configuration you will be able to store hundreds of templates.

`{{SERVER}}/server/email/list-templates`

| Variable | Description                                           |
| -------- | ----------------------------------------------------- |
| page     | Page number for pagination.                           |
| limit    | How many records per page (min=5, max=50, default=5). |

**Request**

```JSON
{
    "page": 1,
    "limit": 20
}
```

**Response**

```JSON
{
    "valid": true,
    "templates": [
        "welcome-email.html"
    ],
    "count": 1,
    "total_pages": 1
}
```

### Removing a template

To remove a template simply provide the template name in a `POST` request.

`{{SERVER}}/server/email/remove-template`

**Request**

```JSON
{
    "fileName": "welcome-email.html"
}
```

**Response**

```JSON
{
    "valid": true
}
```

or

```JSON
{
    "msg": "File does not exist",
    "valid": false,
    "code": "EML001_400022"
}
```

</div>

## Send an email

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

### Adding to email queue

### Responses from email queue

</div>

</div>

<br/>
<br/>
<br/>

# Task Queue

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

### Adding task to queue

### Remove task from queue

### Responses from task queue

</div>

</div>
