-- Check user points and redemption history for a specific user
SELECT 
    u.id,
    u.username,
    u.points as current_points,
    COUNT(rh.id) as total_redemptions,
    SUM(rh.points_spent) as total_points_spent
FROM users u
LEFT JOIN redemption_history rh ON u.id = rh.user_id
GROUP BY u.id, u.username, u.points
ORDER BY u.id DESC; 