-- Cleanup duplicate users and add unique constraint
-- This script should be run to fix the duplicate users issue

-- Step 1: Delete duplicate users, keeping only the first occurrence of each email
DELETE FROM users 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM users 
    GROUP BY email
);

-- Step 2: Add unique constraint to email column
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Step 3: Verify cleanup
SELECT email, COUNT(*) as count 
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;
-- This query should return no results if cleanup was successful