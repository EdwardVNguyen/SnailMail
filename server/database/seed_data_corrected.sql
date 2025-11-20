-- ====================================================================
-- SnailMail Database Seed Data (Corrected for actual schema)
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM email_queue;
DELETE FROM inventory_notifications;
DELETE FROM inventory;
DELETE FROM complaint;
DELETE FROM courier_package_request;
DELETE FROM transaction;
DELETE FROM tracking_event;
DELETE FROM package;
DELETE FROM employee;
DELETE FROM customer;
DELETE FROM authentication;
DELETE FROM facility;
DELETE FROM address;

SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- ADDRESS DATA (50 addresses)
-- ====================================================================

-- Facility addresses (1-10)
INSERT INTO address (address_id, street_name, city_name, state_name, zip_code) VALUES
(1, '123 Main St', 'Springfield', 'IL', '62701'),
(2, '456 Oak Ave', 'Madison', 'WI', '53703'),
(3, '789 Pine Rd', 'Austin', 'TX', '73301'),
(4, '321 Elm St', 'Denver', 'CO', '80202'),
(5, '654 Maple Dr', 'Portland', 'OR', '97201'),
(6, '987 Cedar Ln', 'Seattle', 'WA', '98101'),
(7, '147 Birch Blvd', 'Phoenix', 'AZ', '85001'),
(8, '258 Willow Way', 'Atlanta', 'GA', '30301'),
(9, '369 Spruce St', 'Boston', 'MA', '02101'),
(10, '741 Ash Ave', 'Miami', 'FL', '33101');

-- Customer addresses (11-30) - for senders
INSERT INTO address (address_id, street_name, city_name, state_name, zip_code) VALUES
(11, '100 Customer Ln', 'Springfield', 'IL', '62702'),
(12, '200 Buyer St', 'Madison', 'WI', '53704'),
(13, '300 Shopper Ave', 'Austin', 'TX', '73302'),
(14, '400 Client Rd', 'Denver', 'CO', '80203'),
(15, '500 Patron Dr', 'Portland', 'OR', '97202'),
(16, '600 User Blvd', 'Seattle', 'WA', '98102'),
(17, '700 Member Way', 'Phoenix', 'AZ', '85002'),
(18, '800 Guest Ct', 'Atlanta', 'GA', '30302'),
(19, '900 Visitor Pl', 'Boston', 'MA', '02102'),
(20, '1000 Order St', 'Miami', 'FL', '33102');

-- Customer addresses (31-40) - for recipients
INSERT INTO address (address_id, street_name, city_name, state_name, zip_code) VALUES
(31, '500 Dest St', 'Madison', 'WI', '53701'),
(32, '600 Target Ave', 'Austin', 'TX', '78701'),
(33, '700 Finish Rd', 'Denver', 'CO', '80201'),
(34, '800 End Dr', 'Portland', 'OR', '97201'),
(35, '900 Final Blvd', 'Seattle', 'WA', '98101'),
(36, '1000 Last Way', 'Phoenix', 'AZ', '85001'),
(37, '1100 Done Ct', 'Atlanta', 'GA', '30301'),
(38, '1200 Complete Pl', 'Boston', 'MA', '02101'),
(39, '1300 Transit St', 'Miami', 'FL', '33101'),
(40, '1400 Moving Ave', 'Springfield', 'IL', '62701');

-- Employee addresses (41-50)
INSERT INTO address (address_id, street_name, city_name, state_name, zip_code) VALUES
(41, '2100 Worker Ln', 'Springfield', 'IL', '62703'),
(42, '2200 Staff St', 'Madison', 'WI', '53705'),
(43, '2300 Employee Ave', 'Austin', 'TX', '73303'),
(44, '2400 Team Rd', 'Denver', 'CO', '80204'),
(45, '2500 Crew Dr', 'Portland', 'OR', '97203'),
(46, '2600 Labor Blvd', 'Seattle', 'WA', '98103'),
(47, '2700 Personnel Way', 'Phoenix', 'AZ', '85003'),
(48, '2800 Associate Ct', 'Atlanta', 'GA', '30303'),
(49, '2900 Colleague Pl', 'Boston', 'MA', '02103'),
(50, '3000 Workforce St', 'Miami', 'FL', '33103');

-- ====================================================================
-- AUTHENTICATION DATA (30 accounts - no account_type here)
-- ====================================================================

-- Customer auth accounts (1-20)
INSERT INTO authentication (auth_id, email, password) VALUES
(1, 'alice.johnson@email.com', 'password123'),
(2, 'bob.smith@email.com', 'password123'),
(3, 'carol.williams@email.com', 'password123'),
(4, 'david.brown@email.com', 'password123'),
(5, 'emma.davis@email.com', 'password123'),
(6, 'frank.miller@email.com', 'password123'),
(7, 'grace.wilson@email.com', 'password123'),
(8, 'henry.moore@email.com', 'password123'),
(9, 'isabel.taylor@email.com', 'password123'),
(10, 'jack.anderson@email.com', 'password123'),
(11, 'john.recipient@email.com', 'password123'),
(12, 'jane.customer@email.com', 'password123'),
(13, 'mike.user@email.com', 'password123'),
(14, 'sarah.buyer@email.com', 'password123'),
(15, 'tom.client@email.com', 'password123'),
(16, 'lisa.patron@email.com', 'password123'),
(17, 'david.member@email.com', 'password123'),
(18, 'emma.guest@email.com', 'password123'),
(19, 'chris.visitor@email.com', 'password123'),
(20, 'amy.shopper@email.com', 'password123');

-- Employee auth accounts (21-30)
INSERT INTO authentication (auth_id, email, password) VALUES
(21, 'manager.john@snailmail.com', 'manager123'),
(22, 'manager.sarah@snailmail.com', 'manager123'),
(23, 'clerk.mike@snailmail.com', 'clerk123'),
(24, 'clerk.lisa@snailmail.com', 'clerk123'),
(25, 'clerk.james@snailmail.com', 'clerk123'),
(26, 'courier.alex@snailmail.com', 'courier123'),
(27, 'courier.jordan@snailmail.com', 'courier123'),
(28, 'courier.taylor@snailmail.com', 'courier123'),
(29, 'courier.morgan@snailmail.com', 'courier123'),
(30, 'courier.casey@snailmail.com', 'courier123');

-- ====================================================================
-- CUSTOMER DATA (20 customers - 10 senders, 10 recipients)
-- ====================================================================

-- Sender customers (1-10) with payment info
INSERT INTO customer (customer_id, first_name, last_name, birth_date, address_id, auth_id, card_number, security_code, expiration_date) VALUES
(1, 'Alice', 'Johnson', '1990-05-15', 11, 1, '4532015112830366', '123', '12/2026'),
(2, 'Bob', 'Smith', '1985-08-22', 12, 2, '5425233430109903', '456', '06/2027'),
(3, 'Carol', 'Williams', '1992-03-10', 13, 3, '4916338506082832', '789', '09/2026'),
(4, 'David', 'Brown', '1988-11-30', 14, 4, '5105105105105100', '321', '03/2027'),
(5, 'Emma', 'Davis', '1995-07-18', 15, 5, '4024007134564842', '654', '01/2028'),
(6, 'Frank', 'Miller', '1983-04-25', 16, 6, '378282246310005', '987', '11/2026'),
(7, 'Grace', 'Wilson', '1991-09-12', 17, 7, '371449635398431', '147', '08/2027'),
(8, 'Henry', 'Moore', '1987-12-05', 18, 8, '6011111111111117', '258', '10/2026'),
(9, 'Isabel', 'Taylor', '1993-02-28', 19, 9, '6011000990139424', '369', '05/2027'),
(10, 'Jack', 'Anderson', '1989-06-14', 20, 10, '3530111333300000', '741', '02/2028');

-- Recipient customers (11-20) - may not have payment info
INSERT INTO customer (customer_id, first_name, last_name, birth_date, address_id, auth_id) VALUES
(11, 'John', 'Recipient', '1992-01-15', 31, 11),
(12, 'Jane', 'Customer', '1988-06-20', 32, 12),
(13, 'Mike', 'User', '1990-09-25', 33, 13),
(14, 'Sarah', 'Buyer', '1994-03-12', 34, 14),
(15, 'Tom', 'Client', '1986-11-08', 35, 15),
(16, 'Lisa', 'Patron', '1991-07-22', 36, 16),
(17, 'David', 'Member', '1989-04-18', 37, 17),
(18, 'Emma', 'Guest', '1993-12-30', 38, 18),
(19, 'Chris', 'Visitor', '1987-08-14', 39, 19),
(20, 'Amy', 'Shopper', '1995-02-05', 40, 20);

-- ====================================================================
-- FACILITY DATA (10 facilities with required fields)
-- ====================================================================

INSERT INTO facility (facility_id, facility_name, address_id, status, facility_type, opening_hours, closing_hours, days_of_week) VALUES
(1, 'Springfield Central Hub', 1, 'active', 'warehouse', '08:00:00', '18:00:00', 'monday,tuesday,wednesday,thursday,friday'),
(2, 'Madison Distribution Center', 2, 'active', 'post_office', '09:00:00', '17:00:00', 'monday,tuesday,wednesday,thursday,friday,saturday'),
(3, 'Austin Sorting Facility', 3, 'active', 'warehouse', '07:00:00', '19:00:00', 'monday,tuesday,wednesday,thursday,friday'),
(4, 'Denver Processing Center', 4, 'active', 'post_office', '08:30:00', '17:30:00', 'monday,tuesday,wednesday,thursday,friday,saturday'),
(5, 'Portland Mail Hub', 5, 'active', 'warehouse', '08:00:00', '18:00:00', 'monday,tuesday,wednesday,thursday,friday'),
(6, 'Seattle Distribution Point', 6, 'active', 'post_office', '09:00:00', '17:00:00', 'monday,tuesday,wednesday,thursday,friday,saturday'),
(7, 'Phoenix Logistics Center', 7, 'active', 'warehouse', '07:30:00', '18:30:00', 'monday,tuesday,wednesday,thursday,friday'),
(8, 'Atlanta Regional Hub', 8, 'active', 'post_office', '08:00:00', '17:00:00', 'monday,tuesday,wednesday,thursday,friday,saturday'),
(9, 'Boston Sorting Station', 9, 'active', 'warehouse', '08:00:00', '18:00:00', 'monday,tuesday,wednesday,thursday,friday'),
(10, 'Miami Fulfillment Center', 10, 'inactive', 'warehouse', '08:00:00', '17:00:00', 'monday,tuesday,wednesday,thursday,friday');

-- ====================================================================
-- EMPLOYEE DATA (account_type is here, facility_id required)
-- ====================================================================

-- Managers (1-2)
INSERT INTO employee (employee_id, first_name, last_name, address_id, auth_id, account_type, employee_ssn, salary, facility_id) VALUES
(1, 'John', 'Manager', 41, 21, 'manager', '111-22-3333', 85000.00, 1),
(2, 'Sarah', 'Executive', 42, 22, 'manager', '222-33-4444', 90000.00, 2);

-- Clerks (3-5)
INSERT INTO employee (employee_id, first_name, last_name, address_id, auth_id, account_type, employee_ssn, salary, facility_id) VALUES
(3, 'Mike', 'Clerk', 43, 23, 'clerk', '333-44-5555', 45000.00, 1),
(4, 'Lisa', 'Handler', 44, 24, 'clerk', '444-55-6666', 46000.00, 2),
(5, 'James', 'Processor', 45, 25, 'clerk', '555-66-7777', 45500.00, 3);

-- Couriers (6-10)
INSERT INTO employee (employee_id, first_name, last_name, address_id, auth_id, account_type, employee_ssn, salary, facility_id) VALUES
(6, 'Alex', 'Courier', 46, 26, 'courier', '666-77-8888', 42000.00, 1),
(7, 'Jordan', 'Driver', 47, 27, 'courier', '777-88-9999', 43000.00, 2),
(8, 'Taylor', 'Carrier', 48, 28, 'courier', '888-99-0000', 42500.00, 3),
(9, 'Morgan', 'Deliverer', 49, 29, 'courier', '999-00-1111', 44000.00, 4),
(10, 'Casey', 'Transporter', 50, 30, 'courier', '100-11-2222', 42000.00, 5);

-- ====================================================================
-- PACKAGE DATA (uses recipient_id foreign key to customer table)
-- ====================================================================

INSERT INTO package (package_id, tracking_number, sender_id, recipient_id, package_type, weight, length, width, height, package_status, facility_id) VALUES
-- Delivered packages
(1, 'SNM10000000001', 1, 11, 'parcel', 2.50, 30.00, 20.00, 15.00, 'delivered', 2),
(2, 'SNM10000000002', 2, 12, 'package', 5.00, 40.00, 30.00, 25.00, 'delivered', 3),
(3, 'SNM10000000003', 3, 13, 'mail', 0.50, 25.00, 15.00, 5.00, 'delivered', 4),
(4, 'SNM10000000004', 4, 14, 'envelope', 0.20, 30.00, 22.00, 2.00, 'delivered', 5),
(5, 'SNM10000000005', 5, 15, 'parcel', 3.00, 35.00, 25.00, 20.00, 'delivered', 6),

-- In-transit packages
(6, 'SNM10000000006', 6, 16, 'package', 4.50, 38.00, 28.00, 22.00, 'in-transit', 1),
(7, 'SNM10000000007', 7, 17, 'mail', 1.00, 28.00, 18.00, 8.00, 'in-transit', 2),

-- Out for delivery packages
(8, 'SNM10000000008', 8, 18, 'parcel', 2.80, 32.00, 22.00, 18.00, 'out-for-delivery', 3),
(9, 'SNM10000000009', 9, 19, 'envelope', 0.30, 31.00, 23.00, 3.00, 'out-for-delivery', 4),

-- Processing packages
(10, 'SNM10000000010', 10, 20, 'parcel', 3.50, 36.00, 26.00, 21.00, 'processing', 5);

-- ====================================================================
-- TRACKING EVENT DATA (uses tracking_event_id auto-increment)
-- ====================================================================

-- Package 1 tracking (delivered)
INSERT INTO tracking_event (package_id, event_type, event_time, location_id) VALUES
(1, 'processing', '2025-01-10 08:00:00', 1),
(1, 'out-for-delivery', '2025-01-11 09:00:00', 2),
(1, 'delivered', '2025-01-11 15:30:00', 2);

-- Package 2 tracking (delivered)
INSERT INTO tracking_event (package_id, event_type, event_time, location_id) VALUES
(2, 'processing', '2025-01-11 09:00:00', 2),
(2, 'out-for-delivery', '2025-01-12 10:00:00', 3),
(2, 'delivered', '2025-01-12 16:45:00', 3);

-- Package 3 tracking (delivered)
INSERT INTO tracking_event (package_id, event_type, event_time, location_id) VALUES
(3, 'processing', '2025-01-12 10:00:00', 3),
(3, 'out-for-delivery', '2025-01-13 08:30:00', 4),
(3, 'delivered', '2025-01-13 14:20:00', 4);

-- Package 4 tracking (delivered)
INSERT INTO tracking_event (package_id, event_type, event_time, location_id) VALUES
(4, 'processing', '2025-01-13 08:30:00', 4),
(4, 'out-for-delivery', '2025-01-14 09:00:00', 5),
(4, 'delivered', '2025-01-14 15:10:00', 5);

-- Package 5 tracking (delivered)
INSERT INTO tracking_event (package_id, event_type, event_time, location_id) VALUES
(5, 'processing', '2025-01-14 09:30:00', 5),
(5, 'out-for-delivery', '2025-01-15 08:00:00', 6),
(5, 'delivered', '2025-01-15 16:30:00', 6);

-- Package 6 tracking (in-transit)
INSERT INTO tracking_event (package_id, event_type, event_time, location_id) VALUES
(6, 'processing', '2025-01-18 09:00:00', 1);

-- Package 7 tracking (in-transit)
INSERT INTO tracking_event (package_id, event_type, event_time, location_id) VALUES
(7, 'processing', '2025-01-18 10:00:00', 2);

-- Package 8 tracking (out for delivery)
INSERT INTO tracking_event (package_id, event_type, event_time, location_id) VALUES
(8, 'processing', '2025-01-17 09:00:00', 3),
(8, 'out-for-delivery', '2025-01-19 08:00:00', 3);

-- Package 9 tracking (out for delivery)
INSERT INTO tracking_event (package_id, event_type, event_time, location_id) VALUES
(9, 'processing', '2025-01-17 10:00:00', 4),
(9, 'out-for-delivery', '2025-01-19 09:00:00', 4);

-- Package 10 tracking (processing)
INSERT INTO tracking_event (package_id, event_type, event_time, location_id) VALUES
(10, 'processing', '2025-01-18 12:00:00', 5);

-- ====================================================================
-- TRANSACTION DATA (no facility_id, uses cost_fee and date_time)
-- ====================================================================

INSERT INTO transaction (transaction_id, package_id, cost_fee, date_time, estimated_shipping_time) VALUES
(1, 1, 7.50, '2025-01-10 08:00:00', '1-2 business days'),
(2, 2, 12.00, '2025-01-11 09:00:00', '2-3 business days'),
(3, 3, 4.50, '2025-01-12 10:00:00', '1-2 business days'),
(4, 4, 3.00, '2025-01-13 08:30:00', '1 business day'),
(5, 5, 8.25, '2025-01-14 09:30:00', '1-2 business days'),
(6, 6, 11.75, '2025-01-18 09:00:00', '2-3 business days'),
(7, 7, 5.50, '2025-01-18 10:00:00', '1-2 business days'),
(8, 8, 7.00, '2025-01-17 09:00:00', '1 business day'),
(9, 9, 3.50, '2025-01-17 10:00:00', '1 business day'),
(10, 10, 9.00, '2025-01-18 12:00:00', '2-3 business days');

-- ====================================================================
-- COURIER PACKAGE REQUEST DATA
-- ====================================================================

INSERT INTO courier_package_request (request_id, package_id, courier_id, request_status, request_date, reviewed_by, review_date) VALUES
-- Approved requests
(1, 1, 6, 'approved', '2025-01-10 09:00:00', 3, '2025-01-10 09:30:00'),
(2, 2, 7, 'approved', '2025-01-11 10:00:00', 4, '2025-01-11 10:30:00'),
(3, 3, 8, 'approved', '2025-01-12 11:00:00', 5, '2025-01-12 11:30:00'),

-- Pending requests
(4, 8, 8, 'pending', '2025-01-19 08:00:00', NULL, NULL),
(5, 9, 9, 'pending', '2025-01-19 09:00:00', NULL, NULL);

-- ====================================================================
-- COMPLAINT DATA (completely different structure)
-- ====================================================================

INSERT INTO complaint (complaint_id, complaint_type, first_name, last_name, customer_id, email, phone_number, issue_type, package_id) VALUES
(1, 'customer', 'Alice', 'Johnson', 1, 'alice.johnson@email.com', '555-0101', 'damaged package', 1),
(2, 'customer', 'Carol', 'Williams', 3, 'carol.williams@email.com', '555-0103', 'delayed delivery', 3),
(3, 'customer', 'Isabel', 'Taylor', 9, 'isabel.taylor@email.com', '555-0109', 'lost package', NULL);

-- ====================================================================
-- INVENTORY DATA
-- ====================================================================

INSERT INTO inventory (inventory_id, facility_id, item_name, quantity, min_quantity, unit_of_measure) VALUES
(1, 1, 'Small Boxes', 150, 50, 'units'),
(2, 1, 'Medium Boxes', 200, 75, 'units'),
(3, 1, 'Large Boxes', 100, 30, 'units'),
(4, 2, 'Small Boxes', 180, 50, 'units'),
(5, 2, 'Packing Tape', 60, 20, 'rolls'),
(6, 3, 'Small Boxes', 10, 50, 'units'),
(7, 3, 'Medium Boxes', 25, 75, 'units');

-- ====================================================================
-- INVENTORY NOTIFICATIONS DATA
-- ====================================================================

INSERT INTO inventory_notifications (inventory_id, notification_type, message, is_read) VALUES
(6, 'low_stock', 'Small Boxes inventory at Facility 3 has fallen below minimum quantity (10 of 50 minimum)', 0),
(7, 'low_stock', 'Medium Boxes inventory at Facility 3 has fallen below minimum quantity (25 of 75 minimum)', 0);

-- ====================================================================
-- EMAIL QUEUE DATA
-- ====================================================================

INSERT INTO email_queue (email_id, recipient_email, subject, body, status, created_at) VALUES
(1, 'alice.johnson@email.com', 'Package SNM10000000001 Delivered', 'Your package has been delivered successfully.', 'sent', '2025-01-11 15:30:00'),
(2, 'bob.smith@email.com', 'Package SNM10000000002 Delivered', 'Your package has been delivered successfully.', 'sent', '2025-01-12 16:45:00'),
(3, 'isabel.taylor@email.com', 'Package SNM10000000009 Out for Delivery', 'Your package is out for delivery.', 'pending', '2025-01-19 09:00:00');

-- ====================================================================
-- VERIFICATION
-- ====================================================================

SELECT 'Database seeding completed successfully!' as status;

SELECT
  'addresses' as table_name, COUNT(*) as record_count FROM address
UNION ALL
SELECT 'facilities', COUNT(*) FROM facility
UNION ALL
SELECT 'authentication', COUNT(*) FROM authentication
UNION ALL
SELECT 'customers', COUNT(*) FROM customer
UNION ALL
SELECT 'employees', COUNT(*) FROM employee
UNION ALL
SELECT 'packages', COUNT(*) FROM package
UNION ALL
SELECT 'tracking_events', COUNT(*) FROM tracking_event
UNION ALL
SELECT 'transactions', COUNT(*) FROM transaction
UNION ALL
SELECT 'courier_requests', COUNT(*) FROM courier_package_request
UNION ALL
SELECT 'complaints', COUNT(*) FROM complaint
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'inventory_notifications', COUNT(*) FROM inventory_notifications
UNION ALL
SELECT 'email_queue', COUNT(*) FROM email_queue;
