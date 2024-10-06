export enum EMAIL_STATUS {
  PENDING = "PENDING",
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  BOUNCE = "BOUNCE",
  COMPLAINT = "COMPLAINT",
}

export type EmailDataTypes = {
  readonly id: string;
  readonly api_key: string;
  readonly email: string;
  readonly send_email: string;
  readonly subject: string;
  readonly message_id: string;
  readonly data: string;
  readonly return_api: string;
  status: EMAIL_STATUS;
  open: Boolean;
  readonly updated_at: Date;
  readonly created_at: Date;
};

export type QueueDataTypes = {
  readonly id: string;
  readonly data: string;
  readonly return_api: string;
  triggered: Boolean;
  readonly updated_at: Date;
  readonly expire_date: Date;
  readonly created_at: Date;
};

export type APIKeyTypes = {
  readonly id: string;
  readonly api_key: string;
  readonly api_name: string;
  readonly return_api: string;
  readonly temporary: Boolean;
  readonly expire_date: Date;
  readonly created_at: Date;
};
