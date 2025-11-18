# Database SQL Scripts

This directory contains SQL scripts for database triggers and other database-related operations.

## Courier Package Limit Trigger

**File:** `courier_package_limit_trigger.sql`

**Purpose:** Prevents a courier from having more than 5 active packages in their inventory at any given time.

### How It Works

The trigger enforces a business rule that limits each courier to a maximum of 5 packages simultaneously. It:

1. Fires **BEFORE INSERT** or **BEFORE UPDATE** on the `package` table
2. Checks if a `courier_id` is being assigned to a package
3. Counts the courier's current active packages (excludes: delivered, returned, lost, undeliverable)
4. Raises an error if the courier already has 5 or more packages

### Installation

To install this trigger in your database, run:

```bash
mysql -u your_username -p your_database_name < courier_package_limit_trigger.sql
```

Or execute the SQL file in your MySQL client:

```sql
SOURCE /path/to/courier_package_limit_trigger.sql;
```

### Error Message

If a courier attempts to pick up a 6th package, the database will return:

```
Error Code: 1644
SQLSTATE: 45000
Message: Courier cannot have more than 5 packages in their inventory
```

### Testing

To verify the trigger is working:

1. Assign 5 packages to a courier
2. Attempt to assign a 6th package
3. Verify that an error is raised

### Notes

- The trigger only counts "active" packages (not in final states)
- Final states are: delivered, returned, lost, undeliverable
- The limit is enforced at the database level, ensuring consistency across all applications
