function createEmailTableSQL() {
  const table_name = "email";
  const script = `
CREATE TABLE ${table_name} (
  id  VARCHAR(255) PRIMARY KEY,
  message_id VARCHAR(255) NOT NULL UNIQUE,
  data VARCHAR(255) NOT NULL,
  return_api VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  send_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL, 
  open BOOLEAN NOT NULL, 
  attachments INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (api_key) REFERENCES api_key(api_key)
)`;
  return { table_name, script };
}

function createQueueTableSQL() {
  const table_name = "queue";
  const script = `
CREATE TABLE ${table_name} (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data VARCHAR(255) NOT NULL,
  return_api VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) NOT NULL,
  triggered BOOLEAN, 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expire_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (api_key) REFERENCES api_key(api_key)
)`;
  return { table_name, script };
}

function createAPIKeyTableSQL() {
  const table_name = "api_key";
  const script = `
CREATE TABLE ${table_name} (
  id INT AUTO_INCREMENT PRIMARY KEY,
  api_key VARCHAR(255) NOT NULL UNIQUE,
  api_name VARCHAR(255) NOT NULL UNIQUE,
  return_api VARCHAR(255) NOT NULL,
  temporary BOOLEAN, 
  expire_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;
  return { table_name, script };
}

function createEmailInsertProcedureSQL() {
  const table_name = "inset_email_procedure";
  const script = `
CREATE PROCEDURE insert_email_procedure(
    IN p_data VARCHAR(255),
    IN p_return_api VARCHAR(255),
    IN p_sent BOOLEAN
)
BEGIN
    INSERT INTO email (data, return_api, sent)
    VALUES (p_data, p_return_api, p_sent);
END;`;
  return { table_name, script };
}

function createEmailUpdateProcedureSQL() {
  const table_name = "update_sent_status";
  const script = `
DELIMITER $$

CREATE PROCEDURE ${table_name}(
    IN p_id INT,
    IN p_sent BOOLEAN
)
BEGIN
    UPDATE email
    SET sent = p_sent,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;
END$$

DELIMITER ;`;
  return { table_name, script };
}

function createQueueInsertProcedureSQL() {
  const table_name = "insert_queue_procedure";
  const script = `
DELIMITER $$

CREATE PROCEDURE insert_into_${table_name}(
    IN p_data VARCHAR(255),
    IN p_return_api VARCHAR(255),
    IN p_triggered BOOLEAN,
    IN p_expire_date TIMESTAMP
)
BEGIN
    INSERT INTO queue (data, return_api, triggered, expire_date)
    VALUES (p_data, p_return_api, p_triggered, p_expire_date);
END$$

DELIMITER ;`;
  return { table_name, script };
}

function createQueueUpdateProcedureSQL() {
  const table_name = "update_triggered_status";
  const script = `
DELIMITER $$

CREATE PROCEDURE ${table_name}(
    IN p_id INT,
    IN p_trigger BOOLEAN
)
BEGIN
    UPDATE queue
    SET triggered = p_trigger,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;
END$$

DELIMITER;`;
  return { table_name, script };
}

export const mysql_tables = [
  createAPIKeyTableSQL,
  createEmailTableSQL,
  createQueueTableSQL,
];
