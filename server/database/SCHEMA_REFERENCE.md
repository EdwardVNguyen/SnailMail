# Database Schema Reference
## SnailMail Post Office Database (dbver12)

Last Updated: 2025-01-20

---

## Table: address
```
+--------------+--------------+------+-----+-------------------+-----------------------------------------------+
| Field        | Type         | Null | Key | Default           | Extra                                         |
+--------------+--------------+------+-----+-------------------+-----------------------------------------------+
| address_id   | int          | NO   | PRI | NULL              | auto_increment                                |
| street_name  | varchar(255) | NO   |     | NULL              |                                               |
| city_name    | varchar(255) | NO   |     | NULL              |                                               |
| state_name   | char(2)      | NO   |     | NULL              |                                               |
| zip_code     | char(5)      | NO   |     | NULL              |                                               |
| created_by   | int          | YES  | MUL | NULL              |                                               |
| updated_by   | int          | YES  | MUL | NULL              |                                               |
| created_at   | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED                             |
| last_updated | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
+--------------+--------------+------+-----+-------------------+-----------------------------------------------+
```

---

## Table: authentication
```
+--------------+--------------+------+-----+-------------------+-----------------------------------------------+
| Field        | Type         | Null | Key | Default           | Extra                                         |
+--------------+--------------+------+-----+-------------------+-----------------------------------------------+
| auth_id      | int          | NO   | PRI | NULL              | auto_increment                                |
| email        | varchar(255) | NO   | UNI | NULL              |                                               |
| password     | varchar(255) | NO   |     | NULL              |                                               |
| created_at   | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED                             |
| last_updated | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
+--------------+--------------+------+-----+-------------------+-----------------------------------------------+
```
**Note:** No `account_type` column here - it's in the employee table!

---

## Table: customer
```
+---------------------+--------------+------+-----+-------------------+-----------------------------------------------+
| Field               | Type         | Null | Key | Default           | Extra                                         |
+---------------------+--------------+------+-----+-------------------+-----------------------------------------------+
| customer_id         | int          | NO   | PRI | NULL              | auto_increment                                |
| first_name          | varchar(255) | NO   |     | NULL              |                                               |
| last_name           | varchar(255) | NO   |     | NULL              |                                               |
| address_id          | int          | NO   | MUL | NULL              |                                               |
| auth_id             | int          | YES  | UNI | NULL              |                                               |
| birth_date          | date         | YES  |     | NULL              |                                               |
| created_by          | int          | YES  | MUL | NULL              |                                               |
| updated_by          | int          | YES  | MUL | NULL              |                                               |
| created_at          | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED                             |
| last_updated        | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| card_number         | char(19)     | YES  |     | NULL              |                                               |
| expiration_date     | varchar(7)   | YES  |     | NULL              |                                               |
| security_code       | char(3)      | YES  |     | NULL              |                                               |
| profile_pic         | longblob     | YES  |     | NULL              |                                               |
| profile_picture_url | varchar(255) | YES  |     | NULL              |                                               |
+---------------------+--------------+------+-----+-------------------+-----------------------------------------------+
```
**Note:** `expiration_date` format is `varchar(7)` = 'MM/YYYY'

---

## Table: employee
```
+---------------------+-----------------------------------+------+-----+-------------------+-----------------------------------------------+
| Field               | Type                              | Null | Key | Default           | Extra                                         |
+---------------------+-----------------------------------+------+-----+-------------------+-----------------------------------------------+
| employee_id         | int                               | NO   | PRI | NULL              | auto_increment                                |
| first_name          | varchar(255)                      | NO   |     | NULL              |                                               |
| last_name           | varchar(255)                      | NO   |     | NULL              |                                               |
| account_type        | enum('manager','clerk','courier') | NO   |     | NULL              |                                               |
| address_id          | int                               | NO   | MUL | NULL              |                                               |
| salary              | decimal(10,2)                     | NO   |     | NULL              |                                               |
| employee_ssn        | char(11)                          | NO   | UNI | NULL              |                                               |
| auth_id             | int                               | NO   | UNI | NULL              |                                               |
| created_by          | int                               | YES  | MUL | NULL              |                                               |
| updated_by          | int                               | YES  | MUL | NULL              |                                               |
| created_at          | datetime                          | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED                             |
| last_updated        | datetime                          | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| facility_id         | int                               | NO   | MUL | NULL              |                                               |
| profile_picture_url | varchar(255)                      | YES  |     | NULL              |                                               |
+---------------------+-----------------------------------+------+-----+-------------------+-----------------------------------------------+
```
**Note:** `account_type` is HERE (not in authentication), `facility_id` is REQUIRED, SSN format is 'XXX-XX-XXXX'

---

## Table: facility
```
+---------------+-----------------------------------------------------------------------------+------+-----+-------------------+-----------------------------------------------+
| Field         | Type                                                                        | Null | Key | Default           | Extra                                         |
+---------------+-----------------------------------------------------------------------------+------+-----+-------------------+-----------------------------------------------+
| facility_id   | int                                                                         | NO   | PRI | NULL              | auto_increment                                |
| status        | enum('active','inactive')                                                   | NO   |     | NULL              |                                               |
| facility_name | varchar(255)                                                                | NO   |     | NULL              |                                               |
| address_id    | int                                                                         | NO   | MUL | NULL              |                                               |
| facility_type | enum('warehouse','post_office')                                             | NO   |     | NULL              |                                               |
| days_of_week  | set('monday','tuesday','wednesday','thursday','friday','saturday','sunday') | YES  |     | NULL              |                                               |
| opening_hours | time                                                                        | NO   |     | NULL              |                                               |
| closing_hours | time                                                                        | NO   |     | NULL              |                                               |
| manager_id    | int                                                                         | YES  | MUL | NULL              |                                               |
| created_by    | int                                                                         | YES  | MUL | NULL              |                                               |
| updated_by    | int                                                                         | YES  | MUL | NULL              |                                               |
| created_at    | datetime                                                                    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED                             |
| last_updated  | datetime                                                                    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
+---------------+-----------------------------------------------------------------------------+------+-----+-------------------+-----------------------------------------------+
```
**Note:** `opening_hours` and `closing_hours` are REQUIRED

---

## Table: package
```
+-----------------+---------------------------------------------------------------------------------------------------------------------------------------------+------+-----+-------------------+-----------------------------------------------+
| Field           | Type                                                                                                                                        | Null | Key | Default           | Extra                                         |
+-----------------+---------------------------------------------------------------------------------------------------------------------------------------------+------+-----+-------------------+-----------------------------------------------+
| package_id      | int                                                                                                                                         | NO   | PRI | NULL              | auto_increment                                |
| sender_id       | int                                                                                                                                         | NO   | MUL | NULL              |                                               |
| recipient_id    | int                                                                                                                                         | NO   | MUL | NULL              |                                               |
| package_type    | enum('envelope','parcel','package','mail')                                                                                                  | NO   |     | NULL              |                                               |
| weight          | decimal(10,2)                                                                                                                               | NO   |     | NULL              |                                               |
| length          | decimal(10,2)                                                                                                                               | NO   |     | NULL              |                                               |
| width           | decimal(10,2)                                                                                                                               | NO   |     | NULL              |                                               |
| height          | decimal(10,2)                                                                                                                               | NO   |     | NULL              |                                               |
| package_status  | enum('processing','pre-shipment','in-transit','out-for-delivery','delivered','lost','returned','undeliverable','failed-delivery','damaged') | NO   |     | NULL              |                                               |
| created_by      | int                                                                                                                                         | YES  | MUL | NULL              |                                               |
| updated_by      | int                                                                                                                                         | YES  | MUL | NULL              |                                               |
| created_at      | datetime                                                                                                                                    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED                             |
| last_updated    | datetime                                                                                                                                    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| tracking_number | char(15)                                                                                                                                    | NO   | UNI | NULL              |                                               |
| facility_id     | int                                                                                                                                         | NO   | MUL | NULL              |                                               |
| courier_id      | int                                                                                                                                         | YES  | MUL | NULL              |                                               |
| recipient_email | varchar(255)                                                                                                                                | YES  |     | NULL              |                                               |
+-----------------+---------------------------------------------------------------------------------------------------------------------------------------------+------+-----+-------------------+-----------------------------------------------+
```
**Note:** Uses `recipient_id` (FK to customer), NOT separate recipient name fields. Status values use hyphens (e.g., 'in-transit')

---

## Table: tracking_event
```
+-------------------+--------------------------------------------------------------------------------------------------------------------------------+------+-----+-------------------+-----------------------------------------------+
| Field             | Type                                                                                                                           | Null | Key | Default           | Extra                                         |
+-------------------+--------------------------------------------------------------------------------------------------------------------------------+------+-----+-------------------+-----------------------------------------------+
| tracking_event_id | int                                                                                                                            | NO   | PRI | NULL              | auto_increment                                |
| package_id        | int                                                                                                                            | NO   | MUL | NULL              |                                               |
| location_id       | int                                                                                                                            | YES  | MUL | NULL              |                                               |
| event_time        | datetime                                                                                                                       | NO   |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED                             |
| created_by        | int                                                                                                                            | YES  | MUL | NULL              |                                               |
| updated_by        | int                                                                                                                            | YES  | MUL | NULL              |                                               |
| created_at        | datetime                                                                                                                       | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED                             |
| last_updated      | datetime                                                                                                                       | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| event_type        | enum('processing','pre-shipment','out-for-delivery','delivered','lost','returned','undeliverable','failed-delivery','damaged') | NO   |     | NULL              |                                               |
+-------------------+--------------------------------------------------------------------------------------------------------------------------------+------+-----+-------------------+-----------------------------------------------+
```
**Note:** `tracking_event_id` is auto-increment (don't specify it). Event types use hyphens (e.g., 'out-for-delivery')

---

## Table: transaction
```
+-------------------------+---------------+------+-----+-------------------+-----------------------------------------------+
| Field                   | Type          | Null | Key | Default           | Extra                                         |
+-------------------------+---------------+------+-----+-------------------+-----------------------------------------------+
| transaction_id          | int           | NO   | PRI | NULL              | auto_increment                                |
| package_id              | int           | NO   | MUL | NULL              |                                               |
| cost_fee                | decimal(10,2) | NO   |     | NULL              |                                               |
| date_time               | datetime      | NO   |     | NULL              |                                               |
| estimated_shipping_time | varchar(255)  | YES  |     | NULL              |                                               |
| special_instructions    | text          | YES  |     | NULL              |                                               |
| created_by              | int           | YES  | MUL | NULL              |                                               |
| updated_by              | int           | YES  | MUL | NULL              |                                               |
| created_at              | datetime      | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED                             |
| last_updated            | datetime      | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
+-------------------------+---------------+------+-----+-------------------+-----------------------------------------------+
```
**Note:** Uses `cost_fee` and `date_time` (NOT transaction_amount/transaction_date). NO facility_id column!

---

## Table: courier_package_request
```
+----------------+---------------------------------------+------+-----+-------------------+-----------------------------------------------+
| Field          | Type                                  | Null | Key | Default           | Extra                                         |
+----------------+---------------------------------------+------+-----+-------------------+-----------------------------------------------+
| request_id     | int                                   | NO   | PRI | NULL              | auto_increment                                |
| package_id     | int                                   | NO   | MUL | NULL              |                                               |
| courier_id     | int                                   | NO   | MUL | NULL              |                                               |
| request_status | enum('pending','approved','rejected') | NO   | MUL | pending           |                                               |
| request_date   | datetime                              | NO   |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED                             |
| reviewed_by    | int                                   | YES  | MUL | NULL              |                                               |
| review_date    | datetime                              | YES  |     | NULL              |                                               |
| created_by     | int                                   | YES  | MUL | NULL              |                                               |
| updated_by     | int                                   | YES  | MUL | NULL              |                                               |
| created_at     | datetime                              | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED                             |
| last_updated   | datetime                              | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
+----------------+---------------------------------------+------+-----+-------------------+-----------------------------------------------+
```
**Note:** Uses `request_status`, `request_date`, `review_date`

---

## Table: complaint
```
+----------------+---------------------------------------------------------------------------------------------------------------+------+-----+-------------------+-----------------------------------------------+
| Field          | Type                                                                                                          | Null | Key | Default           | Extra                                         |
+----------------+---------------------------------------------------------------------------------------------------------------+------+-----+-------------------+-----------------------------------------------+
| complaint_id   | int                                                                                                           | NO   | PRI | NULL              | auto_increment                                |
| complaint_type | enum('customer','employee')                                                                                   | NO   |     | NULL              |                                               |
| first_name     | varchar(255)                                                                                                  | NO   |     | NULL              |                                               |
| middle_name    | varchar(255)                                                                                                  | YES  |     | NULL              |                                               |
| last_name      | varchar(255)                                                                                                  | NO   |     | NULL              |                                               |
| customer_id    | int                                                                                                           | YES  | MUL | NULL              |                                               |
| email          | varchar(255)                                                                                                  | NO   |     | NULL              |                                               |
| phone_number   | varchar(63)                                                                                                   | YES  |     | NULL              |                                               |
| issue_type     | enum('lost package','damaged package','delayed delivery','harassment in office','dangerous work environment') | NO   |     | NULL              |                                               |
| package_id     | int                                                                                                           | YES  | MUL | NULL              |                                               |
| created_by     | int                                                                                                           | YES  | MUL | NULL              |                                               |
| updated_by     | int                                                                                                           | YES  | MUL | NULL              |                                               |
| created_at     | datetime                                                                                                      | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED                             |
| last_updated   | datetime                                                                                                      | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
+----------------+---------------------------------------------------------------------------------------------------------------+------+-----+-------------------+-----------------------------------------------+
```
**Note:** Very different structure - has `complaint_type`, `issue_type`, individual name fields

---

## Table: email_queue
```
+-----------------+---------------------------------+------+-----+-------------------+-------------------+
| Field           | Type                            | Null | Key | Default           | Extra             |
+-----------------+---------------------------------+------+-----+-------------------+-------------------+
| email_id        | int                             | NO   | PRI | NULL              | auto_increment    |
| recipient_email | varchar(255)                    | NO   |     | NULL              |                   |
| subject         | varchar(255)                    | NO   |     | NULL              |                   |
| body            | text                            | NO   |     | NULL              |                   |
| status          | enum('pending','sent','failed') | YES  | MUL | pending           |                   |
| created_at      | datetime                        | YES  | MUL | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| sent_at         | datetime                        | YES  |     | NULL              |                   |
| error_message   | text                            | YES  |     | NULL              |                   |
+-----------------+---------------------------------+------+-----+-------------------+-------------------+
```

---

## Table: inventory
```
+------------------+--------------+------+-----+-------------------+-----------------------------------------------+
| Field            | Type         | Null | Key | Default           | Extra                                         |
+------------------+--------------+------+-----+-------------------+-----------------------------------------------+
| inventory_id     | int          | NO   | PRI | NULL              | auto_increment                                |
| facility_id      | int          | NO   | MUL | NULL              |                                               |
| item_name        | varchar(255) | NO   |     | NULL              |                                               |
| item_description | text         | YES  |     | NULL              |                                               |
| quantity         | int          | NO   | MUL | 0                 |                                               |
| min_quantity     | int          | NO   |     | 0                 |                                               |
| unit_of_measure  | varchar(50)  | YES  |     | NULL              |                                               |
| created_by       | int          | YES  |     | NULL              |                                               |
| updated_by       | int          | YES  |     | NULL              |                                               |
| created_at       | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED                             |
| last_updated     | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
+------------------+--------------+------+-----+-------------------+-----------------------------------------------+
```
**Note:** `min_quantity` is REQUIRED (defaults to 0 but should be set)

---

## Table: inventory_notifications
```
+----------------------+---------------------------------------------------+------+-----+-------------------+-------------------+
| Field                | Type                                              | Null | Key | Default           | Extra             |
+----------------------+---------------------------------------------------+------+-----+-------------------+-------------------+
| notification_id      | int                                               | NO   | PRI | NULL              | auto_increment    |
| inventory_id         | int                                               | NO   | MUL | NULL              |                   |
| notification_type    | enum('low_stock','out_of_stock','restock_needed') | NO   |     | NULL              |                   |
| message              | text                                              | NO   |     | NULL              |                   |
| is_read              | tinyint(1)                                        | YES  | MUL | 0                 |                   |
| notified_employee_id | int                                               | YES  | MUL | NULL              |                   |
| created_at           | datetime                                          | YES  | MUL | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| read_at              | datetime                                          | YES  |     | NULL              |                   |
+----------------------+---------------------------------------------------+------+-----+-------------------+-------------------+
```
**Note:** `message` is REQUIRED (not optional)

---

## All Tables List
1. address
2. authentication
3. complaint
4. courier_package_request
5. customer
6. email_queue
7. employee
8. facility
9. inventory
10. inventory_notifications
11. package
12. tracking_event
13. transaction

---

## Important Schema Notes

### Key Column Name Differences (Common Mistakes):
- ❌ `transaction.transaction_date` → ✅ `transaction.date_time`
- ❌ `transaction.transaction_amount` → ✅ `transaction.cost_fee`
- ❌ `transaction.facility_id` → ✅ Does NOT exist (get via package.facility_id)
- ❌ `authentication.account_type` → ✅ `employee.account_type`
- ❌ `customer.expiration_date` as date → ✅ varchar(7) format 'MM/YYYY'
- ❌ `package.recipient_first_name` → ✅ `package.recipient_id` (FK to customer)
- ❌ `tracking_event.event_id` → ✅ `tracking_event.tracking_event_id`
- ❌ `courier_package_request.status` → ✅ `courier_package_request.request_status`

### Enum Values Use Hyphens:
- `package_status`: 'in-transit', 'out-for-delivery' (NOT 'in transit', 'out for delivery')
- `event_type`: 'out-for-delivery', 'pre-shipment' (NOT 'out for delivery')

### Auto-Increment IDs (Don't Specify):
- All `*_id` columns are auto-increment
- Except in seed data where you want specific IDs for testing

### Required Fields Often Missed:
- `facility.opening_hours` and `facility.closing_hours` (required)
- `facility.facility_type` (required)
- `employee.facility_id` (required for all employees)
- `inventory.min_quantity` (required, defaults to 0)
- `inventory_notifications.message` (required)

---

**Generated:** 2025-01-20
**Database:** dbver12
