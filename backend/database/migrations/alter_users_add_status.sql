ALTER TABLE users
ADD COLUMN status ENUM('active', 'banned', 'suspended') DEFAULT 'active',
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP; 