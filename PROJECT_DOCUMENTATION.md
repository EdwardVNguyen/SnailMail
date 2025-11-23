# Post Office Database Management System - Project Documentation

**Version**: 1.0
**Last Updated**: November 22, 2025
**Database Schema**: Version 17

---

## Table of Contents
1. [System Overview](#system-overview)
2. [User Roles and Permissions](#user-roles-and-permissions)
3. [Data Management Operations](#data-management-operations)
4. [Queries and Reports](#queries-and-reports)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)

---

## System Overview

The Post Office Database Management System is a comprehensive web application for managing post office operations, including package tracking, facility management, employee management, and customer services. The system supports multiple user roles with role-specific functionalities and features automated email notifications for package tracking.

**Technology Stack:**
- **Frontend**: React with Vite
- **Backend**: Node.js with native HTTP server
- **Database**: MySQL
- **Authentication**: Session-based with auth_id

---

## User Roles and Permissions

### 1. Customer
**Description**: End users who send and receive packages

**Capabilities:**
- Create and manage user account
- Create new shipments
- Track packages using tracking number
- View package history
- Update personal information (name, address, birth date)
- Manage payment information (card number, CVV, expiration)
- Update email and password (security settings)
- View profile with avatar support
- Delete their own account (soft delete - feature/delete-customer branch)

**Access Level**: Limited to own data only

**Dashboard Features:**
- View all packages (sent and received)
- Create new shipments
- Track packages
- Access profile management

---

### 2. Courier
**Description**: Delivery personnel responsible for transporting and delivering packages

**Capabilities:**
- View available packages for pickup
- Request to pick up packages (requires clerk approval)
- View assigned packages
- Mark packages as picked up
- Deliver packages to recipients
- Update package status during delivery
- View personal profile and information
- View packages out for delivery
- Track delivery history

**Access Level**: Limited to packages assigned to them and facility-specific data

**Dashboard Features:**
- My Packages (currently assigned)
- Available Packages (can request)
- Delivery tracking
- Profile management

**Workflow:**
1. View available packages at their facility
2. Create courier request to pick up a package
3. Wait for clerk approval
4. Pick up approved package
5. Deliver package and mark as delivered

---

### 3. Clerk
**Description**: Administrative staff managing facility operations and package processing

**Capabilities:**
- Create tracking events for packages
- Move packages between facilities
- View packages at all facilities
- View package tracking history
- Update package dimensions (weight, length, width, height)
- Approve or reject courier pickup requests
- View pending courier requests
- Mark packages as delivered
- View and manage packages at their facility
- Access profile information

**Access Level**: Facility-wide access, can manage packages across multiple locations

**Dashboard Features:**
- Packages at Facilities (all locations)
- Courier Request Management
- Package Tracking
- Create Tracking Events
- Profile management

**Key Responsibilities:**
- Process incoming packages
- Coordinate package movement between facilities
- Approve courier assignments
- Update package information
- Monitor package status

---

### 4. Manager
**Description**: Administrative supervisors with full system access

**Capabilities:**
- **Employee Management:**
  - Add new employees (clerk, courier, manager)
  - Update employee information (full profile)
  - Delete employees
  - View all employees by role
  - Check employee ID and SSN uniqueness

- **Facility Management:**
  - Add new facilities (warehouse or post office)
  - Update facility information
  - Delete facilities
  - View all facilities
  - Check facility ID uniqueness
  - Set facility status (active/inactive)

- **Reports and Analytics:**
  - Facility Report (package counts, performance)
  - Clerk Report (performance metrics)
  - Courier Report (delivery statistics)
  - Transaction Report (financial data)
  - Problem Packages Report (lost, damaged, failed delivery)

- **System Monitoring:**
  - View manager notifications
  - Mark notifications as read
  - Access detailed facility information
  - Access detailed employee information
  - Monitor system-wide operations

**Access Level**: Full system access across all facilities, employees, and packages

**Dashboard Features:**
- Employee Management
- Facility Management
- Reports Dashboard
- Notifications
- System Analytics
- Profile management

---

## Data Management Operations

### 1. CREATE Operations (Add New Data)

#### **Customer Data**
- **User Sign Up** (`/userSignUp`)
  - Creates: authentication record, address record, customer record
  - Required: email, password, first name, last name, street, city, state, zip
  - Optional: birth date, card information, profile picture URL

#### **Employee Data**
- **Add Employee** (`/addEmployee`)
  - Manager only
  - Creates: authentication record, address record, employee record
  - Required: email, password, first name, last name, account type (manager/clerk/courier), SSN, salary, facility assignment
  - Optional: profile picture URL

#### **Facility Data**
- **Add Facility** (`/addFacility`)
  - Manager only
  - Creates: address record, facility record
  - Required: facility name, type (warehouse/post_office), address, operating hours, days of week
  - Optional: manager assignment, status

#### **Package Data**
- **Create Shipment** (`/createShipment`)
  - Customer only (authenticated)
  - Creates: customer record (if recipient doesn't exist), address record, package record, transaction record
  - Required: recipient information, package dimensions, type, facility
  - Automatically: generates tracking number, creates email notification via trigger

- **Create Package** (`/createPackage`)
  - For guest users (non-authenticated senders)
  - Similar to createShipment but allows non-authenticated sender

#### **Tracking Data**
- **Create Tracking Event** (`/createTrackingEvent`)
  - Clerk only
  - Creates: tracking_event record
  - Required: package_id, event_type, location
  - Updates: package status automatically

- **Create Tracking Events (Bulk)** (`/createTrackingEvents`)
  - Move packages between facilities
  - Creates: multiple tracking_event records

#### **Courier Request**
- **Create Courier Request** (`/createCourierRequest`)
  - Courier only
  - Creates: courier_package_request record
  - Required: package_id, courier_id
  - Status: pending (awaits clerk approval)

---

### 2. UPDATE Operations (Modify Existing Data)

#### **Customer Updates**
- **Update Customer Info** (`/updateCustomerInfo`)
  - Updates: name, address, birth date, payment info, profile picture URL
  - Self-service: customers update own data

- **Update Customer Contact** (`/updateCustomer`)
  - Updates: name, address, birth date
  - Simplified version of updateCustomerInfo

- **Update Security** (`/updateSecurity`)
  - Updates: email and/or password
  - Self-service: customers update own credentials

#### **Employee Updates**
- **Update Employee Full** (`/updateEmployeeFull`)
  - Manager only
  - Updates: all employee fields including role, salary, facility, SSN

- **Update Employee Info** (`/updateEmployeeInfo`)
  - Self-service or manager
  - Updates: name, address, profile picture

#### **Facility Updates**
- **Update Facility Full** (`/updateFacilityFull`)
  - Manager only
  - Updates: all facility fields including name, type, hours, manager assignment, status

#### **Package Updates**
- **Update Package Dimensions** (`/updatePackageDimensions`)
  - Clerk only
  - Updates: weight, length, width, height

- **Pickup Package** (`/pickupPackage`)
  - Courier only
  - Updates: package status to 'out-for-delivery', assigns courier

- **Deliver Package** (`/deliverPackage`)
  - Courier only
  - Updates: package status to 'delivered'

- **Mark Packages Delivered** (`/markPackagesDelivered`)
  - Bulk delivery marking
  - Updates: multiple packages to delivered status

#### **Courier Request Updates**
- **Approve Courier Request** (`/approveCourierRequest`)
  - Clerk only
  - Updates: request status to 'approved', assigns package to courier

- **Reject Courier Request** (`/rejectCourierRequest`)
  - Clerk only
  - Updates: request status to 'rejected'

#### **Notification Updates**
- **Mark Notification Read** (`/markNotificationRead`)
  - Manager only
  - Updates: notification read status

---

### 3. DELETE Operations (Remove Data)

#### **Employee Deletion**
- **Delete Employee** (`/deleteEmployee`)
  - Manager only
  - Type: **Hard delete** (permanently removes from database)
  - Cascades: May affect related records

#### **Facility Deletion**
- **Delete Facility** (`/deleteFacility`)
  - Manager only
  - Type: **Hard delete**
  - Cascades: May affect related records

#### **Customer Deletion**
- **Delete Customer** (`/deleteCustomer`)
  - Customer only (self-service)
  - Type: **Soft delete** (sets is_deleted flag)
  - Preserves: All package history, transactions, tracking data
  - Effect: Customer can no longer log in or perform actions
  - **Note**: Available on feature/delete-customer branch

---

### 4. READ Operations (Query Data)

#### **Customer Queries**
- **Get Customer Data** (`/getCustomerData?authId=X`)
  - Returns: Full customer profile with address and authentication info

- **Get Customer Package Data** (`/getCustomerPackageData?authId=X`)
  - Returns: All packages for customer (sent and received)

#### **Employee Queries**
- **Get Employee Data** (`/getEmployeeData?authId=X`)
  - Returns: Full employee profile with address and facility info

- **Get Employee ID** (`/getEmployeeId?authId=X`)
  - Returns: employee_id for given auth_id

- **Get Employees** (`/getEmployees` or `/getEmployees?role=courier`)
  - Returns: All employees or filtered by role

- **Get Next Employee ID** (`/getNextEmployeeId`)
  - Returns: Next available employee_id for ID generation

- **Check Employee Uniqueness** (`/checkEmployeeUniqueness?employeeId=X&ssn=Y`)
  - Validates: ID and SSN uniqueness before creation

#### **Facility Queries**
- **Get Facilities** (`/getFacilities`)
  - Returns: All facilities with addresses and operating information

- **Get Facility For Customer** (`/getFacilityForCustomer?zipCode=X`)
  - Returns: Nearest facility based on ZIP code

- **Get Next Facility ID** (`/getNextFacilityId`)
  - Returns: Next available facility_id

- **Check Facility Uniqueness** (`/checkFacilityUniqueness?facilityId=X`)
  - Validates: Facility ID uniqueness

#### **Package Queries**
- **Get Packages By Facility** (`/getPackagesByFacility?facilityId=X`)
  - Returns: All packages at specified facility

- **Get Packages At Facilities** (`/getPackagesAtFacilities?employeeId=X`)
  - Clerk: Returns packages at clerk's facility
  - Returns: Package list with tracking info

- **Get Out For Delivery Packages** (`/getOutForDeliveryPackages?facilityId=X`)
  - Returns: All packages currently out for delivery from facility

- **Get Available Packages For Courier** (`/getAvailablePackagesForCourier`)
  - Courier: Returns packages available for pickup request

- **Get My Courier Packages** (`/getMyCourierPackages?courierId=X`)
  - Returns: All packages assigned to specific courier

- **Tracking** (`/tracking?trackingNumber=X`)
  - Public: Returns tracking history and current status

- **Get Package Tracking History** (`/getPackageTrackingHistory?packageId=X`)
  - Returns: Complete tracking event history

#### **Courier Request Queries**
- **Get Pending Courier Requests** (`/getPendingCourierRequests?employeeId=X`)
  - Clerk: Returns all pending pickup requests at their facility

#### **Other Queries**
- **Get Address Data** (`/getAddressData`)
  - Returns: Address information

- **Email Check** (`/checkEmail?email=X`)
  - Validates: Email availability during signup

---

## Queries and Reports

### 1. Facility Report
**Endpoint**: `/getFacilityReport`
**Access**: Manager only

**Provides:**
- Total number of facilities
- Facilities by type (warehouse vs post office)
- Facilities by status (active vs inactive)
- Package distribution across facilities
- Facility performance metrics

---

### 2. Facility Details Report
**Endpoint**: `/getFacilityDetails?facilityId=X`
**Access**: Manager only

**Provides:**
- Complete facility information
- Assigned manager
- Operating hours and days
- Address details
- Package count at facility
- Employee count at facility
- Recent package activity

---

### 3. Clerk Report
**Endpoint**: `/getClerkReport`
**Access**: Manager only

**Provides:**
- Total number of clerks
- Clerks by facility
- Performance metrics per clerk
- Packages processed statistics
- Average processing time

---

### 4. Clerk Details Report
**Endpoint**: `/getClerkDetails?employeeId=X`
**Access**: Manager only

**Provides:**
- Complete clerk information
- Assigned facility
- Packages processed count
- Recent activity
- Performance rating

---

### 5. Courier Report
**Endpoint**: `/getCourierReport`
**Access**: Manager only

**Provides:**
- Total number of couriers
- Couriers by facility
- Delivery statistics
- Average deliveries per courier
- On-time delivery rate
- Active vs idle couriers

---

### 6. Courier Details Report
**Endpoint**: `/getCourierDetails?employeeId=X`
**Access**: Manager only

**Provides:**
- Complete courier information
- Assigned facility
- Total deliveries count
- Current assigned packages
- Delivery history
- Performance metrics

---

### 7. Transaction Report
**Endpoint**: `/getTransactionReport`
**Access**: Manager only

**Provides:**
- Total revenue
- Transactions by date range
- Revenue by package type
- Average transaction value
- Payment method breakdown
- Top customers by transaction volume

---

### 8. Problem Packages Report
**Endpoint**: `/getProblemPackagesReport`
**Access**: Manager only

**Provides:**
- Count of lost packages
- Count of damaged packages
- Count of failed deliveries
- Count of returned packages
- Total problem packages
- Problem package trends

**Note**: Filtered by problem statuses: 'lost', 'returned', 'failed-delivery', 'damaged'

---

### 9. Manager Notifications
**Endpoint**: `/getManagerNotifications?managerId=X`
**Access**: Manager only

**Provides:**
- Unread notification count
- Recent notifications
- Critical system alerts
- Package issue notifications
- Employee activity notifications

---

## Database Schema

### Core Tables

#### **authentication**
- Stores login credentials
- Fields: auth_id (PK), email (UNIQUE), password, timestamps

#### **address**
- Stores physical addresses
- Fields: address_id (PK), street_name, city_name, state_name, zip_code, audit fields

#### **customer**
- Stores customer information
- Fields: customer_id (PK), first_name, last_name, address_id (FK), auth_id (FK, NULLABLE), birth_date, payment info, profile_picture_url, audit fields
- **Important**: auth_id can be NULL for non-authenticated recipients

#### **employee**
- Stores employee information
- Fields: employee_id (PK), first_name, last_name, account_type (manager/clerk/courier), address_id (FK), facility_id (FK), salary, employee_ssn (UNIQUE), auth_id (FK, REQUIRED), profile_picture_url, audit fields

#### **facility**
- Stores facility information
- Fields: facility_id (PK), status (active/inactive), facility_name, address_id (FK), facility_type (warehouse/post_office), days_of_week, opening_hours, closing_hours, manager_id (FK to employee, NULLABLE)

#### **package**
- Stores package information
- Fields: package_id (PK), sender_id (FK to customer), recipient_id (FK to customer), package_type, weight, dimensions, package_status, tracking_number (UNIQUE), facility_id (FK), courier_id (FK, NULLABLE), recipient_email (NULLABLE), audit fields
- **Statuses**: processing, pre-shipment, in-transit, out-for-delivery, delivered, lost, returned, undeliverable, failed-delivery, damaged

#### **tracking_event**
- Stores package tracking history
- Fields: tracking_event_id (PK), package_id (FK), location_id (FK to address, NULLABLE), event_time, event_type, audit fields

#### **transaction**
- Stores transaction information
- Fields: transaction_id (PK), package_id (FK), cost_fee, date_time, estimated_shipping_time, special_instructions, audit fields

#### **courier_package_request**
- Stores courier pickup requests
- Fields: request_id (PK), package_id (FK), courier_id (FK), request_status (pending/approved/rejected), request_date, review_date, reviewed_by (FK to employee), audit fields

#### **email_queue** (Version 17)
- Stores automated email notifications
- Fields: email_id (PK), recipient_email, tracking_number, email_type (package_created/package_issue), subject, body, status (pending/sent/failed), created_at, sent_at, error_message, attempts
- **Automated by triggers**: after_package_insert, after_package_status_update

---

### Database Triggers (Version 17)

#### **after_package_insert**
- Fires: After package INSERT
- Action: Automatically creates email notification
- Logic: Checks recipient_email first, then falls back to auth table email
- Creates: email_queue entry with email_type='package_created'

#### **after_package_status_update**
- Fires: After package UPDATE when status changes
- Triggers on: 'lost', 'returned', 'failed-delivery', 'damaged'
- Action: Sends notifications to BOTH sender and recipient
- Creates: email_queue entries with email_type='package_issue'

---

## API Endpoints

### Authentication Endpoints
- `POST /login` - User login
- `POST /userSignUp` - Customer registration
- `POST /checkEmail` - Verify email availability

### Customer Endpoints
- `GET /getCustomerData?authId=X` - Get customer profile
- `GET /getCustomerPackageData?authId=X` - Get customer packages
- `POST /updateCustomerInfo` - Update customer profile
- `POST /updateCustomer` - Update customer contact info
- `POST /updateSecurity` - Update email/password
- `POST /deleteCustomer` - Delete customer account (soft delete)

### Employee Endpoints (Manager Access)
- `POST /addEmployee` - Create new employee
- `POST /updateEmployeeFull` - Update employee (all fields)
- `POST /deleteEmployee` - Delete employee
- `GET /getEmployeeData?authId=X` - Get employee profile
- `GET /getEmployees` or `?role=X` - List employees
- `GET /getNextEmployeeId` - Get next available ID
- `GET /checkEmployeeUniqueness` - Validate ID/SSN

### Facility Endpoints (Manager Access)
- `POST /addFacility` - Create new facility
- `POST /updateFacilityFull` - Update facility (all fields)
- `POST /deleteFacility` - Delete facility
- `GET /getFacilities` - List all facilities
- `GET /getFacilityForCustomer?zipCode=X` - Find nearest facility
- `GET /getNextFacilityId` - Get next available ID
- `GET /checkFacilityUniqueness` - Validate facility ID

### Package Endpoints
- `POST /createShipment` - Create new shipment (authenticated customer)
- `POST /createPackage` - Create package (guest user)
- `POST /updatePackageDimensions` - Update package size/weight (clerk)
- `GET /tracking?trackingNumber=X` - Track package (public)
- `GET /getPackagesByFacility?facilityId=X` - Packages at facility
- `GET /getPackagesAtFacilities?employeeId=X` - Clerk's facility packages
- `GET /getPackageTrackingHistory?packageId=X` - Full tracking history

### Courier Endpoints
- `POST /createCourierRequest` - Request package pickup
- `GET /getAvailablePackagesForCourier` - Packages available for request
- `GET /getMyCourierPackages?courierId=X` - Assigned packages
- `POST /pickupPackage` - Mark package picked up
- `POST /deliverPackage` - Mark package delivered
- `GET /getOutForDeliveryPackages?facilityId=X` - Out for delivery list

### Clerk Endpoints
- `POST /createTrackingEvent` - Create tracking event
- `POST /createTrackingEvents` - Bulk tracking events
- `POST /approveCourierRequest` - Approve pickup request
- `POST /rejectCourierRequest` - Reject pickup request
- `POST /markPackagesDelivered` - Bulk mark delivered
- `GET /getPendingCourierRequests?employeeId=X` - Pending requests

### Manager Reports
- `GET /getFacilityReport` - Facility analytics
- `GET /getFacilityDetails?facilityId=X` - Facility details
- `GET /getClerkReport` - Clerk performance
- `GET /getClerkDetails?employeeId=X` - Clerk details
- `GET /getCourierReport` - Courier analytics
- `GET /getCourierDetails?employeeId=X` - Courier details
- `GET /getTransactionReport` - Financial report
- `GET /getProblemPackagesReport` - Problem packages count
- `GET /getManagerNotifications?managerId=X` - System notifications
- `POST /markNotificationRead` - Mark notification as read

---

## Special Features

### 1. Automated Email Notifications
- Triggered automatically by database triggers
- Package creation emails sent to recipients
- Problem package emails sent to both sender and recipient
- Email worker processes queue every 30 seconds
- Retry logic with attempt tracking

### 2. Package Tracking
- Public tracking via tracking number
- Complete event history
- Real-time status updates
- Location tracking at facility level

### 3. Courier Request Workflow
- Couriers request package pickup
- Clerks approve/reject requests
- Automatic package assignment on approval
- Request history tracking

### 4. Guest Shipment Creation
- Non-authenticated users can create packages
- Automatic customer record creation for recipients
- Email notifications sent to recipient

### 5. Profile Management
- Avatar support via profile_picture_url
- Separate profile pages for customers and employees
- Self-service profile updates
- Security settings management

### 6. Soft Delete for Customers
- Preserves all historical data
- Prevents login and actions
- Maintains transaction history for auditing
- **Available on feature/delete-customer branch**

---

## System Architecture Notes

### Frontend (React)
- Role-based routing and access control
- Separate dashboards for each user role
- Real-time data updates
- Profile management with avatar support

### Backend (Node.js)
- Native HTTP server (no Express)
- Route handling via custom routers
- MySQL connection pooling
- Background email worker
- Transaction support for data consistency

### Database (MySQL)
- Relational model with foreign key constraints
- Audit fields on all tables (created_by, updated_by, timestamps)
- Automatic triggers for email notifications
- Unique constraints for tracking numbers, emails, SSNs

---

## Future Enhancements (Potential)

1. **Authentication Improvements**
   - JWT tokens instead of session-based
   - Password hashing (bcrypt)
   - Two-factor authentication

2. **Reporting Enhancements**
   - Date range filters
   - Export to PDF/Excel
   - Graphical dashboards
   - Real-time analytics

3. **Package Features**
   - Signature on delivery
   - Photo proof of delivery
   - Insurance options
   - Priority shipping

4. **Communication**
   - In-app messaging
   - SMS notifications
   - Push notifications
   - Customer support chat

5. **Payment Processing**
   - Integration with payment gateways
   - Multiple payment methods
   - Invoice generation
   - Refund processing

---

**Document Version**: 1.0
**Last Updated**: November 22, 2025
**Maintainer**: Development Team
