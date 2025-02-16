-- Add points column to users table with default value of 1000
ALTER TABLE users
ADD COLUMN points INT DEFAULT 1000;

-- Update existing users to have 1000 points if they don't have any
UPDATE users SET points = 1000 WHERE points IS NULL; 