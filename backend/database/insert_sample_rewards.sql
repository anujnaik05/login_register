-- Clear existing items (optional)
DELETE FROM redemption_items;

-- Reset auto increment
ALTER TABLE redemption_items AUTO_INCREMENT = 1;

-- Insert sample redemption items with real placeholder images
INSERT INTO redemption_items (name, description, points_required, category, image_url, stock, status) VALUES
-- Merchandise
('Eco-Friendly Water Bottle', 'Reusable stainless steel water bottle with climate action logo', 500, 'merchandise', 'https://via.placeholder.com/300x200?text=Water+Bottle', 50, 'available'),
('Organic Cotton T-Shirt', 'Sustainable t-shirt made from organic cotton with eco-message', 800, 'merchandise', 'https://via.placeholder.com/300x200?text=Eco+Tshirt', 30, 'available'),
('Bamboo Utensil Set', 'Portable bamboo cutlery set for zero-waste dining', 400, 'merchandise', 'https://via.placeholder.com/300x200?text=Utensil+Set', 40, 'available'),
('Solar Power Bank', 'Portable solar-powered charger for devices', 1200, 'merchandise', 'https://via.placeholder.com/300x200?text=Power+Bank', 25, 'available'),

-- Vouchers
('Eco Store Voucher', '$20 voucher for sustainable products at partner stores', 600, 'vouchers', 'https://via.placeholder.com/300x200?text=Store+Voucher', 100, 'available'),
('Plant Tree Certificate', 'Certificate for planting a tree in your name', 300, 'vouchers', 'https://via.placeholder.com/300x200?text=Tree+Certificate', 200, 'available'),
('Workshop Pass', 'Free pass to attend any environmental workshop', 700, 'vouchers', 'https://via.placeholder.com/300x200?text=Workshop+Pass', 50, 'available'),

-- Experiences
('Wildlife Sanctuary Visit', 'Guided tour of local wildlife sanctuary', 1000, 'experiences', 'https://via.placeholder.com/300x200?text=Wildlife+Tour', 20, 'available'),
('Eco Farm Tour', 'Day trip to sustainable farm with hands-on activities', 900, 'experiences', 'https://via.placeholder.com/300x200?text=Farm+Tour', 15, 'available'),
('Conservation Project', 'Participate in weekend conservation project', 800, 'experiences', 'https://via.placeholder.com/300x200?text=Conservation', 25, 'available'),

-- Donations
('Plant 10 Trees', 'Donate points to plant 10 trees in deforested areas', 500, 'donations', 'https://via.placeholder.com/300x200?text=Plant+Trees', 999, 'available'),
('Marine Cleanup', 'Support ocean cleanup initiatives', 400, 'donations', 'https://via.placeholder.com/300x200?text=Marine+Cleanup', 999, 'available'),
('Wildlife Protection', 'Contribute to wildlife protection programs', 600, 'donations', 'https://via.placeholder.com/300x200?text=Wildlife', 999, 'available'); 