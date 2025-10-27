import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

// Create tracking events for multiple packages
export const createTrackingEventsController = async (req, res) => {
  let packageIds, destinationFacilityId, travelTime, eventStatus, authId;

  // Parse request body
  try {
    const body = await getJSONRequestBody(req);
    packageIds = body.packageIds;
    destinationFacilityId = body.destinationFacilityId;
    travelTime = body.travelTime;
    eventStatus = body.eventStatus || 'in transit'; // Default to 'in transit' if not provided
    authId = body.authId;

    if (!packageIds || !Array.isArray(packageIds) || packageIds.length === 0) {
      return badClientRequest(res, 'packageIds array is required');
    }
    if (!destinationFacilityId) {
      return badClientRequest(res, 'destinationFacilityId is required');
    }
    if (!travelTime) {
      return badClientRequest(res, 'travelTime is required');
    }
  } catch (err) {
    return badClientRequest(res, err.message || 'Invalid JSON body');
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let destinationAddressId;
    let eventType = eventStatus; // Use the custom event status
    let packageStatus = eventStatus; // Package status matches event status

    // Check if drop-off or facility destination
    if (destinationFacilityId === 'drop-off') {
      // For drop-off, use the package's recipient address
      // Event type and package status come from eventStatus parameter
      eventType = eventStatus;
      packageStatus = eventStatus;
    } else {
      // Get the destination facility's address_id
      const [facilityRows] = await connection.execute(
        `SELECT address_id FROM facility WHERE facility_id = ?`,
        [destinationFacilityId]
      );

      if (facilityRows.length === 0) {
        await connection.rollback();
        return badClientRequest(res, 'Destination facility not found');
      }

      destinationAddressId = facilityRows[0].address_id;
      // Event type and package status are already set from eventStatus parameter
    }

    // Calculate event_time based on travel time
    const eventTime = new Date();
    eventTime.setHours(eventTime.getHours() + parseFloat(travelTime));

    // Create tracking events for each package
    for (const packageId of packageIds) {
      // If drop-off, get the package's recipient address
      if (destinationFacilityId === 'drop-off') {
        const [pkgRows] = await connection.execute(
          `SELECT recipient_address_id FROM package WHERE package_id = ?`,
          [packageId]
        );
        if (pkgRows.length > 0) {
          destinationAddressId = pkgRows[0].recipient_address_id;
        }
      }

      await connection.execute(
        `INSERT INTO tracking_event (package_id, location_id, event_type, event_time, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [packageId, destinationAddressId, eventType, eventTime, authId, authId]
      );

      // Update package status
      await connection.execute(
        `UPDATE package
         SET package_status = ?, updated_by = ?, last_updated = CURRENT_TIMESTAMP
         WHERE package_id = ?`,
        [packageStatus, authId, packageId]
      );
    }

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: `Created tracking events for ${packageIds.length} package(s)`,
      packagesUpdated: packageIds.length
    }));

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Database query failed', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};
