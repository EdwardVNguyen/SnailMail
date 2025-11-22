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

export const updateCustomerInfoController = async (req, res) => {
    let connection;
    try {
        const body = await parseRequestBody(req);
        const { authId, firstName, lastName, birthDate, streetName, cityName, stateName, zipCode, addressId, cardNumber, securityCode, expirationDate, profilePictureUrl } = body;

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

        const updateCustomer = async (field, value) => {
            const updateCustomerQuery = `UPDATE customer SET ${connection.escapeId(field)} = ? WHERE auth_id = ?`;
            // Set to NULL if value is empty, undefined, null, or only whitespace
            if (value === '' || value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
                return await connection.query(updateCustomerQuery, [null, authId]);
            }
            return await connection.query(updateCustomerQuery, [value, authId]);
        }

        await updateCustomer("first_name", firstName);

        await updateCustomer("last_name", lastName);

        await updateCustomer("birth_date", birthDate);

        await updateCustomer("card_number", cardNumber);

        await updateCustomer("security_code", securityCode);

        await updateCustomer("expiration_date", expirationDate);

        await updateCustomer("profile_picture_url", profilePictureUrl);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: 'Customer updated successfully' }));
    }
    catch (error) {
        console.error('Error updating customer:', error);
        badServerRequest(res);
    }
    finally {
        if (connection) connection.release();
    }
};