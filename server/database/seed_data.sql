-- ====================================================================
-- SnailMail Database Seed Data
-- Comprehensive test data for all tables
-- ====================================================================

-- Clear existing data (in correct order to respect foreign keys)
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
-- ADDRESS DATA
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

-- Customer addresses (11-30)
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
(20, '1000 Order St', 'Miami', 'FL', '33102'),
(21, '1100 Ship Ln', 'Chicago', 'IL', '60601'),
(22, '1200 Package Ave', 'Houston', 'TX', '77001'),
(23, '1300 Mail St', 'Philadelphia', 'PA', '19101'),
(24, '1400 Post Rd', 'San Antonio', 'TX', '78201'),
(25, '1500 Delivery Dr', 'San Diego', 'CA', '92101'),
(26, '1600 Parcel Blvd', 'Dallas', 'TX', '75201'),
(27, '1700 Freight Way', 'San Jose', 'CA', '95101'),
(28, '1800 Express Ct', 'Jacksonville', 'FL', '32099'),
(29, '1900 Priority Pl', 'Columbus', 'OH', '43085'),
(30, '2000 Standard St', 'Charlotte', 'NC', '28201');

-- Employee addresses (31-50)
INSERT INTO address (address_id, street_name, city_name, state_name, zip_code) VALUES
(31, '2100 Worker Ln', 'Springfield', 'IL', '62703'),
(32, '2200 Staff St', 'Madison', 'WI', '53705'),
(33, '2300 Employee Ave', 'Austin', 'TX', '73303'),
(34, '2400 Team Rd', 'Denver', 'CO', '80204'),
(35, '2500 Crew Dr', 'Portland', 'OR', '97203'),
(36, '2600 Labor Blvd', 'Seattle', 'WA', '98103'),
(37, '2700 Personnel Way', 'Phoenix', 'AZ', '85003'),
(38, '2800 Associate Ct', 'Atlanta', 'GA', '30303'),
(39, '2900 Colleague Pl', 'Boston', 'MA', '02103'),
(40, '3000 Workforce St', 'Miami', 'FL', '33103'),
(41, '3100 Helper Ln', 'Springfield', 'IL', '62704'),
(42, '3200 Agent St', 'Madison', 'WI', '53706'),
(43, '3300 Rep Ave', 'Austin', 'TX', '73304'),
(44, '3400 Officer Rd', 'Denver', 'CO', '80205'),
(45, '3500 Director Dr', 'Portland', 'OR', '97204'),
(46, '3600 Manager Blvd', 'Seattle', 'WA', '98104'),
(47, '3700 Chief Way', 'Phoenix', 'AZ', '85004'),
(48, '3800 Lead Ct', 'Atlanta', 'GA', '30304'),
(49, '3900 Super Pl', 'Boston', 'MA', '02104'),
(50, '4000 Admin St', 'Miami', 'FL', '33104');

-- ====================================================================
-- FACILITY DATA
-- ====================================================================

INSERT INTO facility (facility_id, facility_name, address_id, status) VALUES
(1, 'Springfield Central Hub', 1, 'active'),
(2, 'Madison Distribution Center', 2, 'active'),
(3, 'Austin Sorting Facility', 3, 'active'),
(4, 'Denver Processing Center', 4, 'active'),
(5, 'Portland Mail Hub', 5, 'active'),
(6, 'Seattle Distribution Point', 6, 'active'),
(7, 'Phoenix Logistics Center', 7, 'active'),
(8, 'Atlanta Regional Hub', 8, 'active'),
(9, 'Boston Sorting Station', 9, 'active'),
(10, 'Miami Fulfillment Center', 10, 'inactive');

-- ====================================================================
-- AUTHENTICATION DATA
-- ====================================================================

-- Customer auth accounts (1-20)
INSERT INTO authentication (auth_id, email, password, account_type) VALUES
(1, 'alice.johnson@email.com', 'password123', 'customer'),
(2, 'bob.smith@email.com', 'password123', 'customer'),
(3, 'carol.williams@email.com', 'password123', 'customer'),
(4, 'david.brown@email.com', 'password123', 'customer'),
(5, 'emma.davis@email.com', 'password123', 'customer'),
(6, 'frank.miller@email.com', 'password123', 'customer'),
(7, 'grace.wilson@email.com', 'password123', 'customer'),
(8, 'henry.moore@email.com', 'password123', 'customer'),
(9, 'isabel.taylor@email.com', 'password123', 'customer'),
(10, 'jack.anderson@email.com', 'password123', 'customer'),
(11, 'kelly.thomas@email.com', 'password123', 'customer'),
(12, 'leo.jackson@email.com', 'password123', 'customer'),
(13, 'mary.white@email.com', 'password123', 'customer'),
(14, 'nathan.harris@email.com', 'password123', 'customer'),
(15, 'olivia.martin@email.com', 'password123', 'customer'),
(16, 'paul.thompson@email.com', 'password123', 'customer'),
(17, 'quinn.garcia@email.com', 'password123', 'customer'),
(18, 'rachel.martinez@email.com', 'password123', 'customer'),
(19, 'steve.robinson@email.com', 'password123', 'customer'),
(20, 'tina.clark@email.com', 'password123', 'customer');

-- Manager auth accounts (21-22)
INSERT INTO authentication (auth_id, email, password, account_type) VALUES
(21, 'manager.john@snailmail.com', 'manager123', 'manager'),
(22, 'manager.sarah@snailmail.com', 'manager123', 'manager');

-- Clerk auth accounts (23-32)
INSERT INTO authentication (auth_id, email, password, account_type) VALUES
(23, 'clerk.mike@snailmail.com', 'clerk123', 'clerk'),
(24, 'clerk.lisa@snailmail.com', 'clerk123', 'clerk'),
(25, 'clerk.james@snailmail.com', 'clerk123', 'clerk'),
(26, 'clerk.anna@snailmail.com', 'clerk123', 'clerk'),
(27, 'clerk.tom@snailmail.com', 'clerk123', 'clerk'),
(28, 'clerk.emily@snailmail.com', 'clerk123', 'clerk'),
(29, 'clerk.chris@snailmail.com', 'clerk123', 'clerk'),
(30, 'clerk.sophia@snailmail.com', 'clerk123', 'clerk'),
(31, 'clerk.robert@snailmail.com', 'clerk123', 'clerk'),
(32, 'clerk.jennifer@snailmail.com', 'clerk123', 'clerk');

-- Courier auth accounts (33-47)
INSERT INTO authentication (auth_id, email, password, account_type) VALUES
(33, 'courier.alex@snailmail.com', 'courier123', 'courier'),
(34, 'courier.jordan@snailmail.com', 'courier123', 'courier'),
(35, 'courier.taylor@snailmail.com', 'courier123', 'courier'),
(36, 'courier.morgan@snailmail.com', 'courier123', 'courier'),
(37, 'courier.casey@snailmail.com', 'courier123', 'courier'),
(38, 'courier.riley@snailmail.com', 'courier123', 'courier'),
(39, 'courier.drew@snailmail.com', 'courier123', 'courier'),
(40, 'courier.sam@snailmail.com', 'courier123', 'courier'),
(41, 'courier.avery@snailmail.com', 'courier123', 'courier'),
(42, 'courier.cameron@snailmail.com', 'courier123', 'courier'),
(43, 'courier.dakota@snailmail.com', 'courier123', 'courier'),
(44, 'courier.blake@snailmail.com', 'courier123', 'courier'),
(45, 'courier.quinn@snailmail.com', 'courier123', 'courier'),
(46, 'courier.parker@snailmail.com', 'courier123', 'courier'),
(47, 'courier.reese@snailmail.com', 'courier123', 'courier');

-- ====================================================================
-- CUSTOMER DATA
-- ====================================================================

INSERT INTO customer (customer_id, auth_id, first_name, last_name, birth_date, address_id, card_number, security_code, expiration_date) VALUES
(1, 1, 'Alice', 'Johnson', '1990-05-15', 11, '4532015112830366', '123', '2026-12-31'),
(2, 2, 'Bob', 'Smith', '1985-08-22', 12, '5425233430109903', '456', '2027-06-30'),
(3, 3, 'Carol', 'Williams', '1992-03-10', 13, '4916338506082832', '789', '2026-09-30'),
(4, 4, 'David', 'Brown', '1988-11-30', 14, '5105105105105100', '321', '2027-03-31'),
(5, 5, 'Emma', 'Davis', '1995-07-18', 15, '4024007134564842', '654', '2028-01-31'),
(6, 6, 'Frank', 'Miller', '1983-04-25', 16, '378282246310005', '987', '2026-11-30'),
(7, 7, 'Grace', 'Wilson', '1991-09-12', 17, '371449635398431', '147', '2027-08-31'),
(8, 8, 'Henry', 'Moore', '1987-12-05', 18, '6011111111111117', '258', '2026-10-31'),
(9, 9, 'Isabel', 'Taylor', '1993-02-28', 19, '6011000990139424', '369', '2027-05-31'),
(10, 10, 'Jack', 'Anderson', '1989-06-14', 20, '3530111333300000', '741', '2028-02-28'),
(11, 11, 'Kelly', 'Thomas', '1994-10-08', 21, '4532015112830367', '852', '2026-07-31'),
(12, 12, 'Leo', 'Jackson', '1986-01-20', 22, '5425233430109904', '963', '2027-04-30'),
(13, 13, 'Mary', 'White', '1990-05-03', 23, '4916338506082833', '159', '2026-12-31'),
(14, 14, 'Nathan', 'Harris', '1992-08-17', 24, '5105105105105101', '357', '2027-11-30'),
(15, 15, 'Olivia', 'Martin', '1988-11-29', 25, '4024007134564843', '753', '2028-03-31'),
(16, 16, 'Paul', 'Thompson', '1991-03-22', 26, '378282246310006', '951', '2026-08-31'),
(17, 17, 'Quinn', 'Garcia', '1987-07-11', 27, '371449635398432', '246', '2027-01-31'),
(18, 18, 'Rachel', 'Martinez', '1993-12-04', 28, '6011111111111118', '135', '2027-09-30'),
(19, 19, 'Steve', 'Robinson', '1989-04-19', 29, '6011000990139425', '864', '2028-06-30'),
(20, 20, 'Tina', 'Clark', '1995-09-27', 30, '3530111333300001', '579', '2026-05-31');

-- ====================================================================
-- EMPLOYEE DATA
-- ====================================================================

-- Managers (1-2)
INSERT INTO employee (employee_id, auth_id, first_name, last_name, address_id, account_type, employee_ssn, salary) VALUES
(1, 21, 'John', 'Manager', 45, 'manager', 111223333, 85000.00),
(2, 22, 'Sarah', 'Executive', 46, 'manager', 222334444, 90000.00);

-- Clerks (3-12) - distributed across facilities
INSERT INTO employee (employee_id, auth_id, first_name, last_name, address_id, account_type, employee_ssn, salary, facility_id) VALUES
(3, 23, 'Mike', 'Clerk', 31, 'clerk', 333445555, 45000.00, 1),
(4, 24, 'Lisa', 'Handler', 32, 'clerk', 444556666, 46000.00, 2),
(5, 25, 'James', 'Processor', 33, 'clerk', 555667777, 45500.00, 3),
(6, 26, 'Anna', 'Sorter', 34, 'clerk', 666778888, 47000.00, 4),
(7, 27, 'Tom', 'Reviewer', 35, 'clerk', 777889999, 45000.00, 5),
(8, 28, 'Emily', 'Checker', 36, 'clerk', 888990000, 46500.00, 6),
(9, 29, 'Chris', 'Validator', 37, 'clerk', 999001111, 45000.00, 7),
(10, 30, 'Sophia', 'Inspector', 38, 'clerk', 100112222, 47500.00, 8),
(11, 31, 'Robert', 'Examiner', 39, 'clerk', 211223333, 45000.00, 9),
(12, 32, 'Jennifer', 'Assessor', 40, 'clerk', 322334444, 46000.00, 1);

-- Couriers (13-27) - distributed across facilities
INSERT INTO employee (employee_id, auth_id, first_name, last_name, address_id, account_type, employee_ssn, salary, facility_id) VALUES
(13, 33, 'Alex', 'Courier', 41, 'courier', 433445555, 42000.00, 1),
(14, 34, 'Jordan', 'Driver', 42, 'courier', 544556666, 43000.00, 2),
(15, 35, 'Taylor', 'Carrier', 43, 'courier', 655667777, 42500.00, 3),
(16, 36, 'Morgan', 'Deliverer', 44, 'courier', 766778888, 44000.00, 4),
(17, 37, 'Casey', 'Transporter', 31, 'courier', 877889999, 42000.00, 5),
(18, 38, 'Riley', 'Messenger', 32, 'courier', 988990000, 43500.00, 6),
(19, 39, 'Drew', 'Runner', 33, 'courier', 199001111, 42000.00, 7),
(20, 40, 'Sam', 'Dispatch', 34, 'courier', 200112222, 45000.00, 8),
(21, 41, 'Avery', 'Express', 35, 'courier', 311223333, 42000.00, 9),
(22, 42, 'Cameron', 'Swift', 36, 'courier', 422334444, 43000.00, 1),
(23, 43, 'Dakota', 'Fast', 37, 'courier', 533445555, 42500.00, 2),
(24, 44, 'Blake', 'Quick', 38, 'courier', 644556666, 44000.00, 3),
(25, 45, 'Quinn', 'Rapid', 39, 'courier', 755667777, 42000.00, 4),
(26, 46, 'Parker', 'Speedy', 40, 'courier', 866778888, 43500.00, 5),
(27, 47, 'Reese', 'Zippy', 41, 'courier', 977889999, 42000.00, 6);

-- ====================================================================
-- PACKAGE DATA
-- ====================================================================

INSERT INTO package (package_id, tracking_number, sender_id, recipient_first_name, recipient_last_name, recipient_email, recipient_street, recipient_city, recipient_state, recipient_zip_code, package_type, weight, length, width, height, package_status, facility_id) VALUES
-- Delivered packages
(1, 'SNM1000000001', 1, 'John', 'Recipient', 'john.r@email.com', '500 Dest St', 'Madison', 'WI', '53701', 'parcel', 2.5, 30, 20, 15, 'delivered', 2),
(2, 'SNM1000000002', 2, 'Jane', 'Customer', 'jane.c@email.com', '600 Target Ave', 'Austin', 'TX', '78701', 'package', 5.0, 40, 30, 25, 'delivered', 3),
(3, 'SNM1000000003', 3, 'Mike', 'User', 'mike.u@email.com', '700 Finish Rd', 'Denver', 'CO', '80201', 'mail', 0.5, 25, 15, 5, 'delivered', 4),
(4, 'SNM1000000004', 4, 'Sarah', 'Buyer', 'sarah.b@email.com', '800 End Dr', 'Portland', 'OR', '97201', 'envelope', 0.2, 30, 22, 2, 'delivered', 5),
(5, 'SNM1000000005', 5, 'Tom', 'Client', 'tom.c@email.com', '900 Final Blvd', 'Seattle', 'WA', '98101', 'parcel', 3.0, 35, 25, 20, 'delivered', 6),
(6, 'SNM1000000006', 6, 'Lisa', 'Patron', 'lisa.p@email.com', '1000 Last Way', 'Phoenix', 'AZ', '85001', 'package', 4.5, 38, 28, 22, 'delivered', 7),
(7, 'SNM1000000007', 7, 'David', 'Member', 'david.m@email.com', '1100 Done Ct', 'Atlanta', 'GA', '30301', 'mail', 1.0, 28, 18, 8, 'delivered', 8),
(8, 'SNM1000000008', 8, 'Emma', 'Guest', 'emma.g@email.com', '1200 Complete Pl', 'Boston', 'MA', '02101', 'parcel', 2.8, 32, 22, 18, 'delivered', 9),

-- In transit packages
(9, 'SNM1000000009', 9, 'Chris', 'Visitor', 'chris.v@email.com', '1300 Transit St', 'Miami', 'FL', '33101', 'package', 6.0, 45, 35, 30, 'in transit', 1),
(10, 'SNM1000000010', 10, 'Amy', 'Shopper', 'amy.s@email.com', '1400 Moving Ave', 'Springfield', 'IL', '62701', 'parcel', 2.2, 29, 19, 14, 'in transit', 2),
(11, 'SNM1000000011', 11, 'Brian', 'Order', 'brian.o@email.com', '1500 Travel Rd', 'Madison', 'WI', '53701', 'mail', 0.8, 26, 16, 6, 'in transit', 3),

-- Out for delivery packages
(12, 'SNM1000000012', 12, 'Carol', 'Ship', 'carol.s@email.com', '1600 Delivery Dr', 'Austin', 'TX', '78701', 'envelope', 0.3, 31, 23, 3, 'out for delivery', 4),
(13, 'SNM1000000013', 13, 'Dan', 'Parcel', 'dan.p@email.com', '1700 Route Blvd', 'Denver', 'CO', '80201', 'parcel', 3.5, 36, 26, 21, 'out for delivery', 5),

-- Processing packages
(14, 'SNM1000000014', 14, 'Eve', 'Freight', 'eve.f@email.com', '1800 Sort Way', 'Portland', 'OR', '97201', 'package', 5.5, 42, 32, 28, 'processing', 6),
(15, 'SNM1000000015', 15, 'Frank', 'Express', 'frank.e@email.com', '1900 Process Ct', 'Seattle', 'WA', '98101', 'mail', 1.2, 27, 17, 7, 'processing', 7),
(16, 'SNM1000000016', 16, 'Grace', 'Priority', 'grace.p@email.com', '2000 Handle Pl', 'Phoenix', 'AZ', '85001', 'parcel', 2.9, 33, 23, 19, 'processing', 8),

-- Lost package
(17, 'SNM1000000017', 17, 'Henry', 'Standard', 'henry.s@email.com', '2100 Lost St', 'Atlanta', 'GA', '30301', 'package', 4.0, 37, 27, 23, 'lost', 9),

-- More packages for variety
(18, 'SNM1000000018', 18, 'Iris', 'Ground', 'iris.g@email.com', '2200 Quick Ave', 'Boston', 'MA', '02101', 'envelope', 0.4, 32, 24, 4, 'delivered', 1),
(19, 'SNM1000000019', 19, 'Jack', 'Air', 'jack.a@email.com', '2300 Fast Rd', 'Springfield', 'IL', '62701', 'parcel', 3.2, 34, 24, 20, 'delivered', 2),
(20, 'SNM1000000020', 20, 'Kate', 'Sea', 'kate.s@email.com', '2400 Ocean Dr', 'Miami', 'FL', '33101', 'package', 7.0, 50, 40, 35, 'in transit', 3);

-- ====================================================================
-- TRACKING EVENT DATA
-- ====================================================================

-- Package 1 tracking (delivered)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(1, 1, 'created', '2025-01-10 08:00:00', 1, 3),
(2, 1, 'in transit', '2025-01-10 10:00:00', 1, 13),
(3, 1, 'received', '2025-01-11 14:00:00', 2, 4),
(4, 1, 'out for delivery', '2025-01-12 08:00:00', 2, 14),
(5, 1, 'delivered', '2025-01-12 15:30:00', 2, 14);

-- Package 2 tracking (delivered)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(6, 2, 'created', '2025-01-11 09:00:00', 2, 4),
(7, 2, 'in transit', '2025-01-11 11:00:00', 2, 14),
(8, 2, 'received', '2025-01-12 15:00:00', 3, 5),
(9, 2, 'out for delivery', '2025-01-13 09:00:00', 3, 15),
(10, 2, 'delivered', '2025-01-13 16:45:00', 3, 15);

-- Package 3 tracking (delivered)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(11, 3, 'created', '2025-01-12 10:00:00', 3, 5),
(12, 3, 'in transit', '2025-01-12 12:00:00', 3, 15),
(13, 3, 'received', '2025-01-13 16:00:00', 4, 6),
(14, 3, 'out for delivery', '2025-01-14 08:30:00', 4, 16),
(15, 3, 'delivered', '2025-01-14 14:20:00', 4, 16);

-- Package 4 tracking (delivered)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(16, 4, 'created', '2025-01-13 08:30:00', 4, 6),
(17, 4, 'in transit', '2025-01-13 10:30:00', 4, 16),
(18, 4, 'received', '2025-01-14 14:30:00', 5, 7),
(19, 4, 'out for delivery', '2025-01-15 09:00:00', 5, 17),
(20, 4, 'delivered', '2025-01-15 15:10:00', 5, 17);

-- Package 5 tracking (delivered)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(21, 5, 'created', '2025-01-14 09:30:00', 5, 7),
(22, 5, 'in transit', '2025-01-14 11:30:00', 5, 17),
(23, 5, 'received', '2025-01-15 15:30:00', 6, 8),
(24, 5, 'out for delivery', '2025-01-16 08:00:00', 6, 18),
(25, 5, 'delivered', '2025-01-16 16:30:00', 6, 18);

-- Package 6 tracking (delivered)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(26, 6, 'created', '2025-01-15 10:30:00', 6, 8),
(27, 6, 'in transit', '2025-01-15 12:30:00', 6, 18),
(28, 6, 'received', '2025-01-16 16:30:00', 7, 9),
(29, 6, 'out for delivery', '2025-01-17 09:30:00', 7, 19),
(30, 6, 'delivered', '2025-01-17 14:50:00', 7, 19);

-- Package 7 tracking (delivered)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(31, 7, 'created', '2025-01-16 11:00:00', 7, 9),
(32, 7, 'in transit', '2025-01-16 13:00:00', 7, 19),
(33, 7, 'received', '2025-01-17 17:00:00', 8, 10),
(34, 7, 'out for delivery', '2025-01-18 08:15:00', 8, 20),
(35, 7, 'delivered', '2025-01-18 15:40:00', 8, 20);

-- Package 8 tracking (delivered)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(36, 8, 'created', '2025-01-17 08:00:00', 8, 10),
(37, 8, 'in transit', '2025-01-17 10:00:00', 8, 20),
(38, 8, 'received', '2025-01-18 14:00:00', 9, 11),
(39, 8, 'out for delivery', '2025-01-19 09:00:00', 9, 21),
(40, 8, 'delivered', '2025-01-19 16:00:00', 9, 21);

-- Package 9 tracking (in transit)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(41, 9, 'created', '2025-01-18 09:00:00', 1, 3),
(42, 9, 'in transit', '2025-01-18 11:00:00', 1, 13);

-- Package 10 tracking (in transit)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(43, 10, 'created', '2025-01-18 10:00:00', 2, 4),
(44, 10, 'in transit', '2025-01-18 12:00:00', 2, 14);

-- Package 11 tracking (in transit)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(45, 11, 'created', '2025-01-18 11:00:00', 3, 5),
(46, 11, 'in transit', '2025-01-18 13:00:00', 3, 15);

-- Package 12 tracking (out for delivery)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(47, 12, 'created', '2025-01-17 09:00:00', 3, 5),
(48, 12, 'in transit', '2025-01-17 11:00:00', 3, 15),
(49, 12, 'received', '2025-01-18 15:00:00', 4, 6),
(50, 12, 'out for delivery', '2025-01-19 08:00:00', 4, 16);

-- Package 13 tracking (out for delivery)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(51, 13, 'created', '2025-01-17 10:00:00', 4, 6),
(52, 13, 'in transit', '2025-01-17 12:00:00', 4, 16),
(53, 13, 'received', '2025-01-18 16:00:00', 5, 7),
(54, 13, 'out for delivery', '2025-01-19 09:00:00', 5, 17);

-- Package 14 tracking (processing)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(55, 14, 'created', '2025-01-18 12:00:00', 6, 8),
(56, 14, 'processing', '2025-01-19 10:00:00', 6, 8);

-- Package 15 tracking (processing)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(57, 15, 'created', '2025-01-18 13:00:00', 7, 9),
(58, 15, 'processing', '2025-01-19 11:00:00', 7, 9);

-- Package 16 tracking (processing)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(59, 16, 'created', '2025-01-18 14:00:00', 8, 10),
(60, 16, 'processing', '2025-01-19 12:00:00', 8, 10);

-- Package 17 tracking (lost)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(61, 17, 'created', '2025-01-15 08:00:00', 8, 10),
(62, 17, 'in transit', '2025-01-15 10:00:00', 8, 20),
(63, 17, 'received', '2025-01-16 14:00:00', 9, 11),
(64, 17, 'lost', '2025-01-19 13:00:00', 9, 11);

-- Package 18 tracking (delivered)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(65, 18, 'created', '2025-01-16 09:00:00', 9, 11),
(66, 18, 'in transit', '2025-01-16 11:00:00', 9, 21),
(67, 18, 'received', '2025-01-17 15:00:00', 1, 3),
(68, 18, 'out for delivery', '2025-01-18 08:00:00', 1, 13),
(69, 18, 'delivered', '2025-01-18 14:30:00', 1, 13);

-- Package 19 tracking (delivered)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(70, 19, 'created', '2025-01-17 08:30:00', 1, 3),
(71, 19, 'in transit', '2025-01-17 10:30:00', 1, 13),
(72, 19, 'received', '2025-01-18 14:30:00', 2, 4),
(73, 19, 'out for delivery', '2025-01-19 08:30:00', 2, 14),
(74, 19, 'delivered', '2025-01-19 15:00:00', 2, 14);

-- Package 20 tracking (in transit)
INSERT INTO tracking_event (event_id, package_id, event_type, event_time, location_id, employee_id) VALUES
(75, 20, 'created', '2025-01-18 09:30:00', 2, 4),
(76, 20, 'in transit', '2025-01-18 11:30:00', 2, 14),
(77, 20, 'received', '2025-01-19 15:30:00', 3, 5);

-- ====================================================================
-- TRANSACTION DATA
-- ====================================================================

INSERT INTO transaction (transaction_id, transaction_date, transaction_amount, package_id, facility_id) VALUES
(1, '2025-01-10 08:00:00', 7.50, 1, 1),
(2, '2025-01-11 09:00:00', 12.00, 2, 2),
(3, '2025-01-12 10:00:00', 4.50, 3, 3),
(4, '2025-01-13 08:30:00', 3.00, 4, 4),
(5, '2025-01-14 09:30:00', 8.25, 5, 5),
(6, '2025-01-15 10:30:00', 11.75, 6, 6),
(7, '2025-01-16 11:00:00', 5.50, 7, 7),
(8, '2025-01-17 08:00:00', 7.00, 8, 8),
(9, '2025-01-18 09:00:00', 15.00, 9, 1),
(10, '2025-01-18 10:00:00', 6.75, 10, 2),
(11, '2025-01-18 11:00:00', 4.25, 11, 3),
(12, '2025-01-17 09:00:00', 3.50, 12, 3),
(13, '2025-01-17 10:00:00', 9.00, 13, 4),
(14, '2025-01-18 12:00:00', 13.50, 14, 6),
(15, '2025-01-18 13:00:00', 5.75, 15, 7),
(16, '2025-01-18 14:00:00', 7.80, 16, 8),
(17, '2025-01-15 08:00:00', 10.50, 17, 8),
(18, '2025-01-16 09:00:00', 3.75, 18, 9),
(19, '2025-01-17 08:30:00', 8.50, 19, 1),
(20, '2025-01-18 09:30:00', 17.50, 20, 2);

-- ====================================================================
-- COURIER PACKAGE REQUEST DATA
-- ====================================================================

INSERT INTO courier_package_request (request_id, package_id, courier_id, request_time, status, reviewed_by, reviewed_time) VALUES
-- Approved requests
(1, 1, 13, '2025-01-10 09:30:00', 'approved', 3, '2025-01-10 09:45:00'),
(2, 2, 14, '2025-01-11 10:30:00', 'approved', 4, '2025-01-11 10:45:00'),
(3, 3, 15, '2025-01-12 11:30:00', 'approved', 5, '2025-01-12 11:45:00'),
(4, 4, 16, '2025-01-13 09:00:00', 'approved', 6, '2025-01-13 09:15:00'),
(5, 5, 17, '2025-01-14 10:00:00', 'approved', 7, '2025-01-14 10:15:00'),
(6, 6, 18, '2025-01-15 11:00:00', 'approved', 8, '2025-01-15 11:15:00'),
(7, 7, 19, '2025-01-16 12:00:00', 'approved', 9, '2025-01-16 12:15:00'),
(8, 8, 20, '2025-01-17 09:00:00', 'approved', 10, '2025-01-17 09:15:00'),

-- Rejected requests
(9, 9, 22, '2025-01-18 10:00:00', 'rejected', 3, '2025-01-18 10:30:00'),

-- Pending requests
(10, 14, 18, '2025-01-19 09:00:00', 'pending', NULL, NULL),
(11, 15, 19, '2025-01-19 10:00:00', 'pending', NULL, NULL),
(12, 16, 20, '2025-01-19 11:00:00', 'pending', NULL, NULL);

-- ====================================================================
-- COMPLAINT DATA
-- ====================================================================

INSERT INTO complaint (complaint_id, customer_id, package_id, complaint_text, complaint_date, status, resolved_by, resolved_date, resolution_notes) VALUES
-- Resolved complaints
(1, 1, 1, 'Package arrived damaged', '2025-01-12 16:00:00', 'resolved', 3, '2025-01-13 10:00:00', 'Refund issued and replacement sent'),
(2, 3, 3, 'Delivery was late', '2025-01-14 15:00:00', 'resolved', 5, '2025-01-15 09:00:00', 'Apologized and provided discount code'),
(3, 17, 17, 'Package is lost', '2025-01-19 14:00:00', 'resolved', 11, '2025-01-19 16:00:00', 'Full refund processed'),

-- Pending complaints
(4, 9, 9, 'Tracking hasn''t updated in 2 days', '2025-01-19 11:00:00', 'pending', NULL, NULL, NULL),
(5, 12, 12, 'Package shows out for delivery but not received', '2025-01-19 12:00:00', 'pending', NULL, NULL, NULL);

-- ====================================================================
-- INVENTORY DATA
-- ====================================================================

INSERT INTO inventory (inventory_id, facility_id, item_name, quantity, last_updated) VALUES
(1, 1, 'Small Boxes', 150, '2025-01-19 08:00:00'),
(2, 1, 'Medium Boxes', 200, '2025-01-19 08:00:00'),
(3, 1, 'Large Boxes', 100, '2025-01-19 08:00:00'),
(4, 1, 'Packing Tape', 50, '2025-01-19 08:00:00'),
(5, 1, 'Bubble Wrap Rolls', 30, '2025-01-19 08:00:00'),
(6, 2, 'Small Boxes', 180, '2025-01-19 08:00:00'),
(7, 2, 'Medium Boxes', 220, '2025-01-19 08:00:00'),
(8, 2, 'Large Boxes', 120, '2025-01-19 08:00:00'),
(9, 2, 'Packing Tape', 60, '2025-01-19 08:00:00'),
(10, 2, 'Bubble Wrap Rolls', 40, '2025-01-19 08:00:00'),
(11, 3, 'Small Boxes', 10, '2025-01-19 08:00:00'),
(12, 3, 'Medium Boxes', 25, '2025-01-19 08:00:00'),
(13, 3, 'Large Boxes', 15, '2025-01-19 08:00:00'),
(14, 3, 'Packing Tape', 5, '2025-01-19 08:00:00'),
(15, 3, 'Bubble Wrap Rolls', 8, '2025-01-19 08:00:00');

-- ====================================================================
-- INVENTORY NOTIFICATIONS DATA
-- ====================================================================

INSERT INTO inventory_notifications (notification_id, inventory_id, notification_date, notification_type, resolved_date) VALUES
(1, 11, '2025-01-19 09:00:00', 'low_stock', NULL),
(2, 14, '2025-01-19 09:30:00', 'low_stock', NULL),
(3, 15, '2025-01-19 10:00:00', 'low_stock', NULL);

-- ====================================================================
-- EMAIL QUEUE DATA
-- ====================================================================

INSERT INTO email_queue (email_id, recipient_email, subject, body, status, created_at) VALUES
(1, 'alice.johnson@email.com', 'Package SNM1000000001 Delivered', 'Your package has been delivered successfully.', 'sent', '2025-01-12 15:30:00'),
(2, 'bob.smith@email.com', 'Package SNM1000000002 Delivered', 'Your package has been delivered successfully.', 'sent', '2025-01-13 16:45:00'),
(3, 'carol.williams@email.com', 'Package SNM1000000003 Delivered', 'Your package has been delivered successfully.', 'sent', '2025-01-14 14:20:00'),
(4, 'isabel.taylor@email.com', 'Package SNM1000000009 In Transit', 'Your package is currently in transit to the destination facility.', 'pending', '2025-01-18 11:00:00'),
(5, 'jack.anderson@email.com', 'Package SNM1000000010 In Transit', 'Your package is currently in transit to the destination facility.', 'pending', '2025-01-18 12:00:00');

-- ====================================================================
-- VERIFICATION QUERIES
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
