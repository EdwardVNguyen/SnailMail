# Database Schema Version 17 Reference

**Database**: post_office_db
**Schema Version**: 17
**Date**: November 21, 2025

## Key Schema Updates in v17

### New email_queue Fields
- `tracking_number` CHAR(15) - Links emails to specific packages
- `email_type` VARCHAR(50) - Type of email (package_created, package_issue, etc.)
- `attempts` INT DEFAULT 0 - Number of send attempts

### Database Triggers

#### 1. `after_package_insert` Trigger
- Fires after package INSERT
- Automatically creates email notification when package is created
- Checks for `recipient_email` first, then falls back to auth table
- Inserts into email_queue with email_type='package_created'

#### 2. `after_package_status_update` Trigger
- Fires after package UPDATE
- Triggers when package_status changes to: 'lost', 'returned', 'failed-delivery', 'damaged'
- Sends notifications to BOTH sender and recipient
- email_type='package_issue'

## Table Structures (v17)

### address (unchanged)
- address_id (PK, AUTO_INCREMENT)
- street_name, city_name, state_name (CHAR(2)), zip_code (CHAR(5))
- created_by, updated_by (FK to authentication)
- created_at, last_updated (DATETIME)

### authentication (unchanged)
- auth_id (PK, AUTO_INCREMENT)
- email (UNIQUE), password
- created_at, last_updated

### customer
- customer_id (PK, AUTO_INCREMENT)
- first_name, last_name
- address_id (FK), auth_id (FK, NULLABLE, UNIQUE)
- birth_date (DATE, NULLABLE)
- card_number (CHAR(19)), expiration_date (VARCHAR(7)), security_code (CHAR(3))
- profile_pic (LONGBLOB), profile_picture_url (VARCHAR(255))
- created_by, updated_by, created_at, last_updated

**IMPORTANT**: auth_id is NULLABLE - allows customers without authentication accounts

### employee
- employee_id (PK, AUTO_INCREMENT)
- first_name, last_name
- account_type ENUM('manager','clerk','courier')
- address_id (FK), facility_id (FK, REQUIRED)
- salary (DECIMAL(10,2)), employee_ssn (CHAR(11), UNIQUE)
- auth_id (FK, REQUIRED, UNIQUE)
- profile_picture_url (VARCHAR(255))
- created_by, updated_by, created_at, last_updated

### facility
- facility_id (PK, AUTO_INCREMENT)
- status ENUM('active','inactive')
- facility_name, address_id (FK)
- facility_type ENUM('warehouse','post_office')
- days_of_week SET('monday'...'sunday')
- opening_hours, closing_hours (TIME, REQUIRED)
- manager_id (FK to employee, NULLABLE)

### package
- package_id (PK, AUTO_INCREMENT)
- sender_id (FK to customer), recipient_id (FK to customer)
- package_type ENUM('envelope','parcel','package','mail')
- weight, length, width, height (DECIMAL(10,2))
- package_status ENUM('processing','pre-shipment','in-transit','out-for-delivery','delivered','lost','returned','undeliverable','failed-delivery','damaged')
- tracking_number (CHAR(15), UNIQUE)
- facility_id (FK), courier_id (FK to employee, NULLABLE)
- **recipient_email (VARCHAR(255), NULLABLE)** - For non-authenticated recipients
- created_by, updated_by, created_at, last_updated

**Key Constraint**: Both sender and recipient must exist in customer table (even if recipient has no auth_id)

### email_queue (UPDATED in v17)
- email_id (PK, AUTO_INCREMENT)
- recipient_email (VARCHAR(255), REQUIRED)
- **tracking_number (CHAR(15), NULLABLE)** - NEW in v17
- **email_type (VARCHAR(50), NULLABLE)** - NEW in v17
  - Values: 'package_created', 'package_issue'
- subject (VARCHAR(255)), body (TEXT)
- status ENUM('pending','sent','failed') DEFAULT 'pending'
- created_at (DATETIME), sent_at (DATETIME)
- error_message (TEXT)
- **attempts (INT DEFAULT 0)** - NEW in v17

### tracking_event
- tracking_event_id (PK, AUTO_INCREMENT)
- package_id (FK), location_id (FK to address, NULLABLE)
- event_time (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- event_type ENUM('processing','pre-shipment','out-for-delivery','delivered','lost','returned','undeliverable','failed-delivery','damaged')
- created_by, updated_by, created_at, last_updated

**Note**: Missing 'in-transit' from event_type enum (but exists in package_status)

### transaction
- transaction_id (PK, AUTO_INCREMENT)
- package_id (FK)
- cost_fee (DECIMAL(10,2)), date_time (DATETIME)
- estimated_shipping_time (VARCHAR(255)), special_instructions (TEXT)
- created_by, updated_by, created_at, last_updated

### courier_package_request
- request_id (PK, AUTO_INCREMENT)
- package_id (FK), courier_id (FK to employee)
- request_status ENUM('pending','approved','rejected') DEFAULT 'pending'
- request_date, review_date (DATETIME)
- reviewed_by (FK to employee)
- created_by, updated_by, created_at, last_updated

## Important Foreign Key Relationships

1. **Customer without auth** is allowed (auth_id nullable)
2. **Package requires both sender AND recipient** as customer records
3. **Recipient can be non-authenticated** - uses recipient_email field
4. **Triggers automatically manage email notifications**

## Critical Implementation Notes

### For "Delete Customer" Functionality:
1. Check if customer is sender/recipient of any packages
2. Package FKs have CASCADE DELETE - deleting customer will delete packages
3. May need to add "soft delete" instead to preserve historical data
4. Auth_id FK also has CASCADE DELETE
5. Consider impact on:
   - Active packages in transit
   - Transaction history
   - Tracking events
   - Email queue entries

### Recommended Approach:
- Add `deleted_at` DATETIME field to customer table (soft delete)
- Add `is_deleted` BOOLEAN field
- Modify queries to filter out deleted customers
- Preserve data for historical/audit purposes
