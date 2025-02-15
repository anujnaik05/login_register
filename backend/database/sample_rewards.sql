-- Insert sample redemption items
INSERT INTO redemption_items (name, description, points_required, category, image_url, stock) VALUES
-- Merchandise
('Eco-Friendly Water Bottle', 'Reusable stainless steel water bottle with climate action logo', 500, 'merchandise', 'https://example.com/water-bottle.jpg', 50),
('Organic Cotton T-Shirt', 'Sustainable t-shirt made from organic cotton with eco-message', 800, 'merchandise', 'https://example.com/tshirt.jpg', 30),
('Bamboo Utensil Set', 'Portable bamboo cutlery set for zero-waste dining', 400, 'merchandise', 'https://example.com/utensils.jpg', 40),
('Solar Power Bank', 'Portable solar-powered charger for devices', 1200, 'merchandise', 'https://example.com/powerbank.jpg', 25),

-- Vouchers
('Eco Store Voucher', '$20 voucher for sustainable products at partner stores', 600, 'vouchers', 'https://example.com/eco-store.jpg', 100),
('Plant Tree Certificate', 'Certificate for planting a tree in your name', 300, 'vouchers', 'https://example.com/tree.jpg', 200),
('Workshop Pass', 'Free pass to attend any environmental workshop', 700, 'vouchers', 'https://example.com/workshop.jpg', 50),

-- Experiences
('Wildlife Sanctuary Visit', 'Guided tour of local wildlife sanctuary', 1000, 'experiences', 'https://example.com/sanctuary.jpg', 20),
('Eco Farm Tour', 'Day trip to sustainable farm with hands-on activities', 900, 'experiences', 'https://example.com/farm.jpg', 15),
('Conservation Project', 'Participate in weekend conservation project', 800, 'experiences', 'https://example.com/conservation.jpg', 25),

-- Donations
('Plant 10 Trees', 'Donate points to plant 10 trees in deforested areas', 500, 'donations', 'https://example.com/trees.jpg', 999),
('Marine Cleanup', 'Support ocean cleanup initiatives', 400, 'donations', 'https://example.com/ocean.jpg', 999),
('Wildlife Protection', 'Contribute to wildlife protection programs', 600, 'donations', 'https://example.com/wildlife.jpg', 999); 