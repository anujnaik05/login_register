-- Products/Items that can be redeemed
CREATE TABLE redemption_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points_required INT NOT NULL,
  category ENUM('merchandise', 'vouchers', 'experiences', 'donations') NOT NULL,
  image_url VARCHAR(255),
  stock INT DEFAULT 0,
  status ENUM('available', 'out_of_stock', 'discontinued') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Points History
CREATE TABLE IF NOT EXISTS user_points (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  points INT NOT NULL,
  action_type ENUM('earned', 'redeemed') NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add some initial points for existing users
INSERT INTO user_points (user_id, points, action_type, description)
SELECT id, 1000, 'earned', 'Welcome bonus'
FROM users
WHERE id NOT IN (SELECT DISTINCT user_id FROM user_points);

-- Redemption History
CREATE TABLE redemption_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  points_spent INT NOT NULL,
  status ENUM('pending', 'approved', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
  shipping_address TEXT,
  redemption_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (item_id) REFERENCES redemption_items(id)
); 