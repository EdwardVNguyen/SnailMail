# SnailMail Database Seed Data

## Overview
This seed data file populates the SnailMail database with comprehensive test data for all tables, enabling immediate testing and demonstration of the application's features.

## What's Included

### Data Summary
- **50 Addresses**: 10 for facilities, 20 for customers, 20 for employees
- **10 Facilities**: 9 active, 1 inactive (for testing)
- **47 Authentication Accounts**: 20 customers, 2 managers, 10 clerks, 15 couriers
- **20 Customers**: All with complete payment information
- **27 Employees**: 2 managers, 10 clerks, 15 couriers distributed across facilities
- **20 Packages**: Various statuses (delivered, in transit, out for delivery, processing, lost)
- **77 Tracking Events**: Complete tracking history for all packages
- **20 Transactions**: Financial records for all packages
- **12 Courier Package Requests**: Approved, rejected, and pending requests
- **5 Complaints**: Both resolved and pending customer complaints
- **15 Inventory Items**: Supplies across multiple facilities
- **3 Inventory Notifications**: Low stock alerts
- **5 Email Queue Entries**: Sample email notifications

### Package Status Distribution
- 8 delivered packages (fully tracked from creation to delivery)
- 4 in-transit packages
- 2 out-for-delivery packages
- 3 processing packages
- 1 lost package (for testing complaint/problem package features)

### Realistic Test Scenarios
The seed data enables testing of:
- Complete package lifecycle tracking
- Multi-facility operations
- Employee roles and permissions (manager, clerk, courier)
- Transaction reporting and financial tracking
- Courier request approval workflow
- Complaint management system
- Inventory tracking and low-stock notifications
- Email notification queue

## How to Use

### Method 1: Using MySQL Command Line
```bash
# Navigate to the database directory
cd server/database

# Run the seed data script
mysql -u your_username -p your_database_name < seed_data.sql
```

### Method 2: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Go to File → Open SQL Script
4. Select `seed_data.sql`
5. Click the Execute button (⚡) to run the entire script

### Method 3: Using phpMyAdmin
1. Login to phpMyAdmin
2. Select your database
3. Click on the "SQL" tab
4. Copy and paste the contents of `seed_data.sql`
5. Click "Go" to execute

## Important Notes

### Foreign Key Constraints
The script automatically handles foreign key constraints by:
1. Disabling foreign key checks
2. Clearing all existing data
3. Inserting new data in the correct order
4. Re-enabling foreign key checks

### Password Information
All test accounts use simple passwords for testing purposes:
- Customer accounts: `password123`
- Manager accounts: `manager123`
- Clerk accounts: `clerk123`
- Courier accounts: `courier123`

**⚠️ WARNING:** Never use these simple passwords in a production environment!

### Test Account Examples

#### Customer Logins
- alice.johnson@email.com / password123
- bob.smith@email.com / password123
- (18 more customer accounts available)

#### Employee Logins
- **Manager**: manager.john@snailmail.com / manager123
- **Clerk**: clerk.mike@snailmail.com / clerk123
- **Courier**: courier.alex@snailmail.com / courier123

### Data Relationships

#### Facility Distribution
- **Facility 1 (Springfield)**: 2 clerks, 2 couriers
- **Facility 2 (Madison)**: 1 clerk, 2 couriers
- **Facilities 3-9**: 1 clerk each, 1-2 couriers each
- **Facility 10 (Miami)**: Inactive (no assigned employees)

#### Package Tracking
Each delivered package has a complete tracking history:
1. Created at origin facility
2. In transit (picked up by courier)
3. Received at destination facility
4. Out for delivery
5. Delivered to recipient

## Verification Queries

After running the seed data, you can verify the data was loaded correctly:

```sql
-- Check record counts for all tables
SELECT
  'addresses' as table_name, COUNT(*) as record_count FROM address
UNION ALL
SELECT 'facilities', COUNT(*) FROM facility
UNION ALL
SELECT 'customers', COUNT(*) FROM customer
UNION ALL
SELECT 'employees', COUNT(*) FROM employee
UNION ALL
SELECT 'packages', COUNT(*) FROM package
UNION ALL
SELECT 'tracking_events', COUNT(*) FROM tracking_event
UNION ALL
SELECT 'transactions', COUNT(*) FROM transaction;
```

Expected results:
- addresses: 50
- facilities: 10
- customers: 20
- employees: 27
- packages: 20
- tracking_events: 77
- transactions: 20

## Testing Scenarios

### 1. Test Complete Package Lifecycle
```sql
-- View complete tracking for package SNM1000000001
SELECT * FROM tracking_event
WHERE package_id = 1
ORDER BY event_time;
```

### 2. Test Manager Reports
- Login as manager.john@snailmail.com
- Navigate to Reports page
- View Facility, Clerk, Courier, and Transaction reports
- All reports should show data for the date range Jan 10-20, 2025

### 3. Test Courier Workflow
- Login as courier.alex@snailmail.com
- View pending package requests
- Should see processing/in-transit packages

### 4. Test Clerk Workflow
- Login as clerk.mike@snailmail.com
- View packages at facility
- Process courier requests (some pending requests available)

### 5. Test Customer Features
- Login as alice.johnson@email.com
- View package history (should see package SNM1000000001 delivered)
- Track package
- Create new shipment (payment info already on file)

### 6. Test Problem Packages
- Package SNM1000000017 is marked as lost
- Associated complaint exists (complaint_id = 3)
- Can be viewed in problem packages report

## Resetting the Database

To reset and reload the seed data:

1. Run the seed_data.sql script again (it clears existing data automatically)
2. Or manually clear all tables first:
```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE email_queue;
TRUNCATE TABLE inventory_notifications;
TRUNCATE TABLE inventory;
TRUNCATE TABLE complaint;
TRUNCATE TABLE courier_package_request;
TRUNCATE TABLE transaction;
TRUNCATE TABLE tracking_event;
TRUNCATE TABLE package;
TRUNCATE TABLE employee;
TRUNCATE TABLE customer;
TRUNCATE TABLE authentication;
TRUNCATE TABLE facility;
TRUNCATE TABLE address;
SET FOREIGN_KEY_CHECKS = 1;
```

## Customization

Feel free to modify the seed data to:
- Add more packages, customers, or employees
- Adjust dates to match your testing needs
- Create specific test scenarios
- Add edge cases for testing

Simply edit the `seed_data.sql` file and add your custom INSERT statements after the existing data.

## Troubleshooting

### Issue: Foreign Key Constraint Errors
**Solution**: Ensure the script runs in its entirety. The script disables foreign key checks at the start and re-enables them at the end.

### Issue: Duplicate Entry Errors
**Solution**: The script clears all existing data before inserting. If you get duplicate errors, ensure no other processes are inserting data concurrently.

### Issue: Date-Related Issues in Reports
**Solution**: The seed data uses dates from January 2025. Adjust the dates in the seed file if you need data from different time periods.

## Support

For issues or questions about the seed data, please check:
1. The main database schema documentation
2. Application feature documentation
3. GitHub repository issues

---

Generated for the SnailMail Post Office Database Management System
