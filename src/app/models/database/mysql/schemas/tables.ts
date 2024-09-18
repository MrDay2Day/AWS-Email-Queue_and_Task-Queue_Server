function createDemoTableSQL() {
  const table_name = "Demo";
  const script = `
    CREATE TABLE ${table_name} (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      age INT,
      dob DATE NOT NULL,
      userType ENUM('Admin', 'User', 'Visitor') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
`;
  return { table_name, script };
}

function createDemo1TableSQL() {
  const table_name = "Demo1";
  const script = `
    CREATE TABLE ${table_name} (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      demo_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (demo_id) REFERENCES Demo(_id)
    )
`;
  return { table_name, script };
}

function createDemoSocketRoomIdTableSQL() {
  const table_name = "DemoSocketRoomId";
  const script = `
    CREATE TABLE ${table_name} (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      demo_id INT NOT NULL,
      socketRoomId VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (demo_id) REFERENCES Demo(_id)
    )
`;
  return { table_name, script };
}

export const mysql_tables = [
  createDemoTableSQL,
  createDemo1TableSQL,
  createDemoSocketRoomIdTableSQL,
];
