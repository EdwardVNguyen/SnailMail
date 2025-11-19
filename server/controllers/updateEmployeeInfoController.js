import pool from '../config/database.js';
import { badServerRequest } from '../utils/badRequest.js';

const parseRequestBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            }
            catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
};

export const updateEmployeeInfoController = async (req, res) => {
    let connection;
    try {
        const body = await parseRequestBody(req);
        const { authId, firstName, lastName, streetName, cityName, stateName, zipCode, addressId, } = body;

        connection = await pool.getConnection();

        const updateAddress = async (field, value) => {
            const updateAddressQuery = `UPDATE address SET ${connection.escapeId(field)} = ? WHERE address_id = ?`;
            if (value === '' || value === undefined) return await connection.query(updateAddressQuery, [null, addressId]);
            return await connection.query(updateAddressQuery, [value, addressId]);
        }
 
        await updateAddress("street_name", streetName);

        await updateAddress("city_name", cityName);

        await updateAddress("state_name", stateName);

        await updateAddress("zip_code", zipCode);

        const updateEmployee = async (field, value) => {
            const updateEmployeeQuery = `UPDATE Employee SET ${connection.escapeId(field)} = ? WHERE auth_id = ?`;
            if (value === '' || value === undefined) return await connection.query(updateEmployeeQuery, [null, authId]);
            return await connection.query(updateEmployeeQuery, [value, authId]);
        }

        await updateEmployee("first_name", firstName);

        await updateEmployee("last_name", lastName);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: 'Employee updated successfully' }));
    }
    catch (error) {
        console.error('Error updating Employee:', error);
        badServerRequest(res);
    }
    finally {
        if (connection) connection.release();
    }
};