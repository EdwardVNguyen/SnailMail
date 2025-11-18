-- Trigger to prevent a courier from having more than 5 packages in their inventory
-- This trigger fires before a package is assigned to a courier

DELIMITER //

-- Trigger for INSERT operations
DROP TRIGGER IF EXISTS before_package_insert_check_courier_limit//
CREATE TRIGGER before_package_insert_check_courier_limit
BEFORE INSERT ON package
FOR EACH ROW
BEGIN
    DECLARE courier_package_count INT;

    -- Only check if a courier is being assigned
    IF NEW.courier_id IS NOT NULL THEN
        -- Count current active packages for this courier
        -- Active packages are those not in final states (delivered, returned, lost, undeliverable)
        SELECT COUNT(*) INTO courier_package_count
        FROM package
        WHERE courier_id = NEW.courier_id
        AND package_status NOT IN ('delivered', 'returned', 'lost', 'undeliverable');

        -- If courier already has 5 or more packages, prevent the assignment
        IF courier_package_count >= 5 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Courier cannot have more than 5 packages in their inventory';
        END IF;
    END IF;
END//

-- Trigger for UPDATE operations
DROP TRIGGER IF EXISTS before_package_update_check_courier_limit//
CREATE TRIGGER before_package_update_check_courier_limit
BEFORE UPDATE ON package
FOR EACH ROW
BEGIN
    DECLARE courier_package_count INT;

    -- Only check if courier_id is being changed or set
    IF NEW.courier_id IS NOT NULL AND (OLD.courier_id IS NULL OR NEW.courier_id != OLD.courier_id) THEN
        -- Count current active packages for this courier
        -- Active packages are those not in final states (delivered, returned, lost, undeliverable)
        SELECT COUNT(*) INTO courier_package_count
        FROM package
        WHERE courier_id = NEW.courier_id
        AND package_status NOT IN ('delivered', 'returned', 'lost', 'undeliverable')
        AND package_id != NEW.package_id; -- Exclude the current package being updated

        -- If courier already has 5 or more packages, prevent the assignment
        IF courier_package_count >= 5 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Courier cannot have more than 5 packages in their inventory';
        END IF;
    END IF;
END//

DELIMITER ;
