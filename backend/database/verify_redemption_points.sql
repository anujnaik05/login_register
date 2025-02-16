-- Check current points for all users
SELECT id, username, email, points 
FROM users;

-- Check redemption history
SELECT 
    rh.id,
    u.username,
    ri.name as item_name,
    rh.points_spent,
    rh.created_at
FROM redemption_history rh
JOIN users u ON rh.user_id = u.id
JOIN redemption_items ri ON rh.item_id = ri.id
ORDER BY rh.created_at DESC; 