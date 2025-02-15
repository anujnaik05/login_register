-- Add created_at column if it doesn't exist
ALTER TABLE users
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add isAdmin column if it doesn't exist
ALTER TABLE users
MODIFY COLUMN isAdmin TINYINT(1) DEFAULT 0;

-- Reset existing admin flags
UPDATE users SET isAdmin = 0; 