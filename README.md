<div style="max-width: 600px; margin-right: auto; margin-left: auto;">

![GitHub License](https://img.shields.io/github/license/MrDay2Day/AWS-Email-Queue_and_Task-Queue_Server) ![GitHub contributors](https://img.shields.io/github/contributors/MrDay2Day/AWS-Email-Queue_and_Task-Queue_Server)
![GitHub last commit](https://img.shields.io/github/last-commit/MrDay2Day/AWS-Email-Queue_and_Task-Queue_Server)

# Task Queue & AWS Email Queue Server

Task Queue with Expiration and Notification API. This microservice allows you to queue tasks with an expiration date and time. It monitors these tasks and triggers a callback to your designated API once a task has expired, ensuring that your services are notified in real-time when deadlines are missed or tasks require follow-up. The expiration logic is fully customizable to meet your workflow needs, allowing seamless integration with your existing systems.

Centralized Email Queue with `AWS-SES` Integration. This microservice enables centralized management of email queues across multiple services. It integrates with Amazon Web Services" Simple Email Service (`AWS-SES`) to handle all email-sending operations. Features include the ability to configure send rates based on your `AWS-SES` account limits, upload and manage `HTML` templates, and send emails with attachments. This service optimizes email delivery performance and ensures compliance with your account"s rate limits, providing a scalable solution for high-volume email dispatch.

Both components work together to streamline task management and email delivery, offering robust and efficient handling of time-sensitive tasks and communication across your services.

# Table of Content

1. [Setup](#setup)
1. [Environment Variables](#environment-variables)
1. [Development](#deployment)
   - [ts-node](#ts-node)
   - [node](#typescript---javascript)
   - [docker-compose](#docker)
1. [Deployment](#deployment)
   - [ts-node](#ts-node-1)
   - [node](#typescript---javascript-1)
   - [docker-compose](#docker-1)
1. [API Keys](#api-keys)
   - [Create API Key](#create-api-key)
   - [Delete API Key](#delete-api-key)
1. [Email Queue](#email-queue)
   - [Send an Email](#send-an-email)
     - [Adding to Email Queue](#adding-to-email-queue)
     - [Responses from Email Queue](#responses-from-email-queue)
   - [Email Records](#email-records)
   - [Email Status Notification Breakdown](#email-notification-status-breakdown)
   - [Tracking Emails](#tracking-emails)
1. [Task Queue](#api-keys)
   - [Add Task to Queue](#adding-task-to-queue)
   - [Remove Task from Queue](#remove-task-from-queue)
   - [Notifications from Task Queue](#notifications-from-task-queue)

# Setup

You can start the server via `TypeScript` using `ts-node`, `ts-node-dev`, `node` compiled from `TypeScript` with or wihtout `Docker` (which is recommened for the quickest deployment).

**IMPORTANT ACTION**

**Copy `.env.template` to `.env`.**

```bash
cp .env.template .env
```

# Environment Variables

| Variable                   | Default Value              | Description                                     |
| -------------------------- | -------------------------- | ----------------------------------------------- |
| ADMIN_API_KEY              | -                          | This API Key is used to do admin actions.       |
| PORT                       | 3852                       | Port for server.                                |
| NODE_ENV                   | dev                        | Either 'dev' or 'production'.                   |
| NODE_VERSION               | node:22.6                  | Node Version for docker.                        |
| APP_NAME                   | Day2Day Email/Queue Server | Application name.                               |
| APP_URL                    | -                          | The domain for the server eg: https://a.bcd.com |
| APP_CONTAINER_NAME         | d2d_email_queue            | Docker container name                           |
| MAX_UPLOAD_SIZE            | 25                         | Max upload size for server per request.         |
| SALT                       | -                          | Secret SALT to create JWT.                      |
| JWT_EXP_HRS                | 3                          | Expire time for JWT in hrs.                     |
| AWS_REGION                 | -                          | AWS SMTP Settings.                              |
| AWS_ACCESS_KEY_ID          | -                          | AWS SMTP Settings.                              |
| AWS_SECRET_ACCESS_KEY      | -                          | AWS SMTP Settings.                              |
| AWS_SES_SEND_LIMIT_PER_SEC | 10                         | 10 emails pre second.                           |
| AWS_SES_QUEUE_WAIT_TIME    | 1000                       | Cool down period before next batch.             |
| AWS_CONFIG_SET_NAME        | email-status               | The default configuration set name for SES.     |
| MYSQL_HOST                 | server-mysql               | Default for docker.                             |
| MYSQL_USER                 | root                       | Default for docker.                             |
| MYSQL_PASS                 | root_password              | Default for docker.                             |
| MYSQL_PORT                 | 3959                       | Default for docker.                             |
| MYSQL_DB                   | d2d_email_queue            | Default for docker.                             |

<br/>
<br/>
<br/>

# Development

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

## ts-node

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

## Typescript -> JavaScript

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

## Docker

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

## ts-node

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

## Typescript -> JavaScript

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

## Docker

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

## Create API Key

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

## Delete API Key

To delete and API Key send a `POST` request with either `api_name` **or** `api_key` to the Email/Queue Server

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

The Email Queue uses AWS-SES to send raw emails _(Email HTML file)_ with attachments _(File Buffer)_.

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

Make a `Form-data` `POST` request to the Email/Queue Server with just the file. The filename of the html file will also be the template name.

`{{SERVER}}/server/email/add-template`

Eg: If the file name is `welcome-email.html` then the template name is `welcome-email`.

| Key  | Type        | Value              |
| ---- | ----------- | ------------------ |
| html | file/buffer | welcome-email.html |

What the server expects to see:

```json
{
  "fieldname": "html",
  "originalname": "welcome-email.html",
  "encoding": "7bit",
  "mimetype": "text/html",
  "buffer": <Buffer 3c 21 44 ... 8390 more bytes>,
  "size": 8440,
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

Emails are sent as `From-data` by using the generated API Key as `Bearer` Token in the `Authorization` Header. `ADMIN_API_KEY` cannot send emails.

**Attachment Allowed MIME Types**

To edit: `src/middleware/multer.ts`

| Extension | File Type          | mimetype                                                                  |
| --------- | ------------------ | ------------------------------------------------------------------------- |
| .gif      | Image              | image/gif                                                                 |
| .jpeg     | Image              | image/jpeg                                                                |
| .png      | Image              | image/png                                                                 |
| .jpg      | Image              | image/jpg                                                                 |
| .csv      | CSV                | text/csv                                                                  |
| .html     | Text               | text/html                                                                 |
| .doc      | MS Word            | application/msword                                                        |
| .docx     | MS Word            | application/vnd.openxmlformats-officedocument.wordprocessingml.document   |
| .xls      | MS Excel           | application/vnd.ms-excel                                                  |
| .xlam     | MS Excel           | application/vnd.ms-excel.addin.macroEnabled.12                            |
| .xlsm     | MS Excel           | application/vnd.ms-excel.sheet.macroEnabled.12                            |
| .xlsx     | MS Excel           | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet         |
| .pdf      | PDF                | application/pdf                                                           |
| .ppt      | MS PowerPoint      | application/vnd.ms-powerpoint                                             |
| .pptx     | MS PowerPoint      | application/vnd.openxmlformats-officedocument.presentationml.presentation |
| .mdb      | MS Access Database | application/vnd.ms-access                                                 |
| .json     | JSON               | application/json                                                          |
| .xml      | XML                | application/xml                                                           |

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

### Adding to email queue

`Form-data` fields required for adding an email to the email queue.

`{{SERVER}}/server/email/add`

| Key        | Type          | Required | Description                                                      |
| ---------- | ------------- | -------- | ---------------------------------------------------------------- |
| shortName  | string d      | Yes      | Senders Name.                                                    |
| email      | string        | Yes      | Recipient Email.                                                 |
| sendEmail  | string        | Yes      | The sending email.                                               |
| replyEmail | string        | Yes      | Email recipient can reply to.                                    |
| subject    | string        | Yes      | The subject of the email.                                        |
| data       | string (JSON) | Yes      | Template data for email.                                         |
| text       | string        | Yes      | Template string that is sent in-place of the template.           |
| template   | string        | Yes      | Name of template eg: If template is "test.html" then type "test" |
| files      | file/buffer   | No       | file/buffer[ ] of files for attachment.                          |

**Response**

```JSON
{
    "queue_id": "UYdo9ZLyVGbEVjEHYDj0-ytWG8b-t94KfQ4kRyOW",
    "valid": true
}
```

### Responses from email queue

If the email is sent or failed your server/service will be notified at the "return_api" that was set when creating your API Key.

A `JWT` will be sent back as a `Bearer` token to your server/service ensure that your server/service has the same secret `SALT` to verify the token signature.

## Email Records

You can retrieve email queue records to check the status of previously sent emails. Access to these records is restricted to the API_KEY used when making the original request.

There are two methods for fetching these records:

- You can either retrieve a specific set of records (max 20 per request) using the queue_id provided when the request was made.
- You can fetch previously sent emails ordered by the most recent date, with a maximum of 50 records per request, in a paginated format.

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

### **Retrieving Email Record**

**Method 1**

Retrieving a specific set of records (max 20 per request) using the queue_id by send a `POST` request.

`{{SERVER}}/server/email/fetch-specific-records`

| Key       | Type      | Value                                  |
| --------- | --------- | -------------------------------------- |
| email_ids | string[ ] | `queue_id` from emails added to queue. |

**Request**

```json
{
  "email_ids": ["StIiOwJiK0AaYybV97Hp-3R95ig-N62MgYcZCw8O"]
}
```

**Response**

```json
{
  "valid": true,
  "result": [
    {
      "email_id": "IL2yFJifMdIj3h0FWUGh-Mr5v14-NjwRuHaUL1MC",
      "email": "name@email.com",
      "send_email": "email@company.com",
      "subject": "Draft Email",
      "data": "{\"NAME\":\"John Brown\",\"ACCOUNT\":238570023,\"BALANCE\":\"$345,600,00\",\"DATE\":\"Monday, November 4th, 2024\",\"SUPPORT_EMAIL\":\"support@company.com\"}",
      "open": false,
      "created_at": "2024-10-13T15:41:06.000Z",
      "updated_at": "2024-10-13T15:41:08.000Z",
      "attachments": 1,
      "api_key": "xxxxx-xxxxxxxxxxxx_xxxxxxxx.1wiTebojwpv2w8WcYAzD"
    }
  ]
}
```

**Method 2**

Retrieving previously sent emails ordered by the most recent date, with a maximum of 50 records per request, in a paginated format.

`{{SERVER}}/server/email/fetch-api-records`

| Key    | Type   | Value                                       |
| ------ | ------ | ------------------------------------------- |
| page   | number | Page number                                 |
| amount | number | Number of results to retrieve min 1 max 50. |

**Request**

```json
{
  "page": 1,
  "amount": 20
}
```

**Response**

```json
{
  "valid": true,
  "result": [
    {
      "email_id": "IL2yFJifMdIj3h0FWUGh-Mr5v14-NjwRuHaUL1MC",
      "email": "name@email.com",
      "send_email": "email@company.com",
      "subject": "Draft Email",
      "data": "{\"NAME\":\"John Brown\",\"ACCOUNT\":238570023,\"BALANCE\":\"$345,600,00\",\"DATE\":\"Monday, November 4th, 2024\",\"SUPPORT_EMAIL\":\"support@company.com\"}",
      "open": false,
      "created_at": "2024-10-13T15:41:06.000Z",
      "updated_at": "2024-10-13T15:41:08.000Z",
      "attachments": 1,
      "api_key": "xxxxx-xxxxxxxxxxxx_xxxxxxxx.1wiTebojwpv2w8WcYAzD"
    }
  ]
}
```

</div>

## Email Notification Status Breakdown

| Status     | Payload                                                 | Description                                            |
| ---------- | ------------------------------------------------------- | ------------------------------------------------------ |
| PROCESSING | {status, email_id, data: {email_data, aws_info}}        | Email is the process of being sent.                    |
| SENT       | {status, email_id, data: {email_data, aws_data}}        | Email sent but not delivered.                          |
| ERROR      | {status, email_id, data: {email_data, aws_info, error}} | Error sending email.                                   |
| DELIVERED  | {status, email_id, data: {email_data, aws_data}}        | Email Delivered.                                       |
| OPEN       | {status, email_id, data: {email_data}}                  | Email has been opened.                                 |
| BOUNCE     | {status, email_id, data: {email_data, aws_data}}        | Email Bounced.                                         |
| COMPLAINT  | {status, email_id, data: {email_data, aws_data}}        | Email has been reported. (This will affect reputation) |

```Javascript
{
  "status": "...",
  "email_id": "...",
  "data":{
    "email_data": {
      "email": "...",
      "send_email": "...",
      "subject": "...",
      "data": {...},
      "open": true,
    },
    "aws_info": {...}, // Optional:
    "aws_data": {...}, // Optional
    "error": {...}, // Optional
  }
}
```

## Tracking Emails

To track email delivery status with AWS Simple Email Service (SES) on your server, you can use Amazon SES Notifications (via SNS - Simple Notification Service) to receive events such as email delivery, bounces, complaints, and rejections. Here's how you can set this up step by step:

**STEP 1 - Enable Notifications in Amazon SES**

First, configure Amazon SES to send event notifications for your emails.

1 - Set up an SNS Topic:

- Go to the Amazon SNS console.
- Create a new SNS Topic where SES will publish events (like delivery, bounce, or complaint notifications).
- After creating the topic, copy the Topic ARN because you'll need it in the next step.
- Set up SES to Publish Notifications:

2 - Go to the Amazon SES console.

- Create Configuration Sets (Ensure this is the same `AWS_CONFIG_SET_NAME`).
- Under the configuration set, choose Event Destinations and add a new one.
- For Destination Type, select SNS.
- Choose the SNS topic you created and select which events (e.g., Delivery, Bounce, Complaint) you want SES to send to this SNS topic.
- Attach this Configuration Set to the emails you send by specifying it in the SendEmail or SendRawEmail API call.

**STEP 2 - Subscribe Your Server to the SNS Topic**

Once SES publishes the notifications to SNS, you'll need to subscribe your server (which will listen for delivery statuses) to the SNS topic.

Subscribe an HTTPS Endpoint to the SNS Topic:

- Go back to the Amazon SNS console.
- Choose the SNS topic you created.
- Click on Create Subscription.
- In Protocol, select HTTPS.
- In Endpoint, enter your server's URL (e.g., `https://{{SERVER}}/email-status`).
- After creating the subscription, SNS will send a confirmation request to your server's URL that will automatically be verified.

</div>

</div>

<br/>
<br/>
<br/>

# Task Queue

Task can only be added to queue using the generated API Key as `Bearer` Token in the `Authorization` Header. `ADMIN_API_KEY` cannot send emails.

A `JWT` will be sent back as a `Bearer` token to your server/service ensure that your server/service has the same secret `SALT` to verify the token signature.

<div style="padding-left: 30px; margin-right: auto; margin-left: auto;">

## Adding task to queue

To add a task to the queue is simply done by sending a `POST` request with the following variables

`{{SERVER}}/server/queue/add`

| Variable   | Description                                     |
| ---------- | ----------------------------------------------- |
| data       | Object with key value pairs.                    |
| expiryDate | A `timestamp` for expire date and time of task. |

**Request**

```JSON
{
    "data": {
        "hello": "world",
        "foo": "bar",
        "value": 1234567890
    },
    "expiryDate": "2024-10-01T20:44:48.858Z"
}
```

**Response**

```JSON
{
    "taskId": "328V32KoEOuy8zLs4pdP-RY8oh9-ep68NY786RsD",
    "valid": true
}
```

## Remove task from queue

To remove a task to the queue is simply done by sending a `POST` request with the following variables

`{{SERVER}}/server/queue/remove`

| Variable | Description               |
| -------- | ------------------------- |
| queue_id | Queue ID for task queued. |

**Request**

```JSON
{
    "queue_id": "328V32KoEOuy8zLs4pdP-RY8oh9-ep68NY786RsD"
}
```

**Response** - Success

```JSON
{
    "removed": true,
    "valid": true
}
```

**Response** - Error

```JSON
{
    "removed": false,
    "msg": "'taskId' does not exist.",
    "valid": false,
    "code": "QUE001_90012"
}
```

## Notifications from Task Queue

When actions are triggered by the queue where a task has been added, manually removed or expired notification is sent to your server/service of the action this is sent to the corresponding `return_api` for the API Key that executed the task.

A `JWT` will be sent back as a `Bearer` token to your server/service ensure that your server/service has the same secret `SALT` to verify the token signature.

When a new task is added to the queue:

```JSON
{
  "queue_id": "qA5Bz-rly3vMUccmHP_mLW25Xjf.SpXIflHVcg4RF5XJ8MTv",
  "expire_data": "2024-11-01T20:44:48.858Z",
  "event": "ADD",
  "data": { "hello": "world", "foo": "bar", "value": 1234567890 }
},
```

When a new task is manually removed from the queue:

```JSON
{
  "queue_id": "qA5Bz-rly3vMUccmHP_mLW25Xjf.SpXIflHVcg4RF5XJ8MTv",
  "expire_data": "2024-11-01T20:44:48.858Z",
  "event": "REMOVE",
  "data": { "hello": "world", "foo": "bar", "value": 1234567890 }
},
```

When a new task has expired:

```JSON
{
  "queue_id": "qA5Bz-rly3vMUccmHP_mLW25Xjf.SpXIflHVcg4RF5XJ8MTv",
  "expire_data": "2024-11-01T20:44:48.858Z",
  "event": "EXPIRED",
  "data": { "hello": "world", "foo": "bar", "value": 1234567890 }
},
```

</div>

</div>
