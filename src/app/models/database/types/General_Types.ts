export type EmailDataTypes = {
  readonly id: string | null;
  readonly data: string | null;
  readonly return_api: string | null;
  sent: Boolean | null;
  readonly updated_at: Date | null;
  readonly created_at: Date | null;
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
  readonly id: string | null;
  readonly api_key: string | null;
  readonly api_name: string | null;
  readonly return_api: string | null;
  readonly temporary: Boolean | null;
  readonly expire_date: Date | null;
  readonly created_at: Date | null;
};
