import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js';
import { badClientRequest, badServerRequest } from '../utils/badRequest.js';

export const updateSecurityController = async (req, res) => {
  let authId,
      currentPassword,
      newEmail,
      newPassword;
  try {
    const body = await getJSONRequestBody(req);
    authId = body.authId;
    currentPassword = body.currentPassword;
    newEmail = body.newEmail;
    newPassword = body.newPassword;

    if (!authId || !currentPassword) {
      return badClientRequest(res, { message: 'Authentication ID and current password are required' });
    }
    if (!newEmail && !newPassword) {
      return badClientRequest(res, { message: 'Please provide either a new email or new password' });
    }
  } catch (err) {
    return badClientRequest(res, err);
  }
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [authRows] = await connection.execute(
      `SELECT email, password FROM authentication WHERE auth_id = ?`,
      [authId]
    );
    if (authRows.length === 0) {
      await connection.rollback();
      return badClientRequest(res, { message: 'User not found' });
    }
    if (authRows[0].password !== currentPassword) {
      await connection.rollback();
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'Current password is incorrect'
      }));
      return;
    }

    // Check if new email already exists (if changing email)
    if (newEmail && newEmail !== authRows[0].email) {
      const [emailCheck] = await connection.execute(
        `SELECT auth_id FROM authentication WHERE email = ? AND auth_id != ?`,
        [newEmail, authId]
      );

      if (emailCheck.length > 0) {
        await connection.rollback();
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          message: 'Email is already in use by another account'
        }));
        return;
      }
    }

    // Build update query dynamically based on what's being changed
    let updateFields = [];
    let updateValues = [];

    if (newEmail) {
      updateFields.push('email = ?');
      updateValues.push(newEmail);
    }

    if (newPassword) {
      updateFields.push('password = ?');
      updateValues.push(newPassword);
    }

    updateValues.push(authId);

    // Update authentication table
    await connection.execute(
      `UPDATE authentication SET ${updateFields.join(', ')} WHERE auth_id = ?`,
      updateValues
    );

    await connection.commit();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Security settings updated successfully'
    }));

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Update security error:', error);
    badServerRequest(res);
  } finally {
    if (connection) connection.release();
  }
};