-- Show table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'admin_users';

-- Show all records
SELECT * FROM admin_users;

-- Count number of records
SELECT COUNT(*) FROM admin_users;
