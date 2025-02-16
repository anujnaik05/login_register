-- Check if all users have points
SELECT id, username, email, points 
FROM users 
WHERE points IS NULL OR points = 0;

-- Update any users with null or 0 points
UPDATE users 
SET points = 1000 
WHERE points IS NULL OR points = 0; 