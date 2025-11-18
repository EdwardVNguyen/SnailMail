-- Drop courier package limit triggers
-- The 5 package limit is now enforced at the application level instead of database level

DROP TRIGGER IF EXISTS before_package_insert_check_courier_limit;
DROP TRIGGER IF EXISTS before_package_update_check_courier_limit;
