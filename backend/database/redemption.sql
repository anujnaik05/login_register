CREATE TABLE IF NOT EXISTS redemption_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points_required INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  image_url TEXT,
  stock INT DEFAULT 0,
  status ENUM('available', 'out_of_stock') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO redemption_items 
  (name, description, points_required, category, stock, status)
VALUES 
  ('Eco-Friendly Water Bottle', 'Reusable water bottle made from recycled materials', 500, 'merchandise', 10, 'available'),
  ('Plant a Tree Certificate', 'We will plant a tree in your name', 300, 'donations', 100, 'available'),
  ('Sustainable Living Workshop', 'Online workshop about sustainable living practices', 800, 'experiences', 20, 'available'),
  ('Local Organic Store Voucher', '$20 voucher for local organic store', 1000, 'vouchers', 5, 'available'); 