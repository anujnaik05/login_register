-- Reset the rewards table
TRUNCATE TABLE redemption_items;

-- Insert fresh sample data
INSERT INTO redemption_items 
(name, description, points_required, category, image_url, stock, status)
VALUES 
('Eco-Friendly Water Bottle', 'Reusable water bottle', 500, 'merchandise', 'https://via.placeholder.com/300x200?text=Water+Bottle', 10, 'available'),
('Plant a Tree', 'Plant a tree in your name', 300, 'donations', 'https://via.placeholder.com/300x200?text=Tree', 100, 'available'),
('Eco Workshop', 'Sustainable living workshop', 800, 'experiences', 'https://via.placeholder.com/300x200?text=Workshop', 20, 'available'),
('Store Voucher', '$20 store voucher', 1000, 'vouchers', 'https://via.placeholder.com/300x200?text=Voucher', 5, 'available'); 