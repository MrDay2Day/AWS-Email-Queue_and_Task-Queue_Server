// Creates a Tables with function and trigger that updates automatically the "updatedat" column with the Date and Time the updated changes were made to the specified row(s) and a "createdat" column that is auto created when u row is added.

function createDemoTablePG() {
  const table_name = "Demo";
  const script = `
  CREATE TABLE IF NOT EXISTS ${table_name} (
    _id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INT,
    dob DATE NOT NULL,
    userType VARCHAR(255) CHECK (userType IN ('Admin', 'User', 'Visitor')),
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE OR REPLACE FUNCTION update_demo_last_updated_column()  
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updatedat = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'update_last_updated' 
      AND tgrelid = '${table_name}'::regclass
    ) THEN
      CREATE TRIGGER update_last_updated
      BEFORE UPDATE ON ${table_name}
      FOR EACH ROW
      EXECUTE PROCEDURE update_demo_last_updated_column();
    END IF;
  END $$;
  `;
  return { table_name, script };
}

function createDemo1TablePG() {
  const table_name = "Demo1";
  const script = `
  CREATE TABLE IF NOT EXISTS "${table_name}" (
    _id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    demoid INT NOT NULL,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (demoid) REFERENCES Demo(_id) ON DELETE CASCADE
  );

  CREATE OR REPLACE FUNCTION update_demo1_last_updated_column()  
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updatedat = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'update_last_updated_demo1' 
      AND tgrelid = '"${table_name}"'::regclass
    ) THEN
      CREATE TRIGGER update_last_updated_demo1
      BEFORE UPDATE ON "${table_name}"
      FOR EACH ROW
      EXECUTE PROCEDURE update_demo1_last_updated_column();
    END IF;
  END $$;
  `;
  return { table_name, script };
}

function createDemoSocketRoomIdTablePG() {
  const table_name = "DemoSocketRoomId";
  const script = `
  CREATE TABLE IF NOT EXISTS "${table_name}" (
    _id SERIAL PRIMARY KEY,
    socket_room_id VARCHAR(255) NOT NULL,
    demoid INT NOT NULL,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (demoid) REFERENCES Demo(_id) ON DELETE CASCADE
  );

  CREATE OR REPLACE FUNCTION update_demo_socket_id_room_last_updated_column()  
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updatedat = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'update_last_updated_demo_socket_room_id' 
      AND tgrelid = '"${table_name}"'::regclass
    ) THEN
      CREATE TRIGGER update_last_updated_demo_socket_room_id
      BEFORE UPDATE ON "${table_name}"
      FOR EACH ROW
      EXECUTE PROCEDURE update_demo_socket_id_room_last_updated_column();
    END IF;
  END $$;
  `;
  return { table_name, script };
}

export const pg_tables = [
  createDemoTablePG,
  createDemo1TablePG,
  createDemoSocketRoomIdTablePG,
];
