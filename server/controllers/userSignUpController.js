import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js'
import { toNullIfBlank } from '../utils/toNullIfBlank.js'
import { badClientRequest, badServerRequest } from '../utils/badRequest.js'

export const userSignUpController = async (req, res) => {

  let email,
      password,
      phoneNumber,
      street,
      city,
      state,
      zipCode,
      firstName,
      middleName,
      lastName,
      accountType

  try {
    const body = await getJSONRequestBody(req)
    email = body.email
    password = body.password
    phoneNumber = body.phoneNumber
    street = body.street
    city = body.city
    state = body.state
    zipCode = body.zipCode
    firstName = body.firstName
    middleName = body.middleName
    lastName = body.lastName
    accountType = body.accountType
  } catch (err) {
    badClientRequest(res, err)
    return
  }
 
  // We want to make a transaction here, all or nothing when inserting user data after they sign up
  // tuples will be created in the authentication, address, and customer relations
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction();

    // insert tuple into authentication relation
    const [authentication] = await connection.execute(
      `INSERT INTO authentication(email, password)
       VALUES(?, ?)`,
       [email, password]
    )

    // insert tuple into address relation
    const [address] = await connection.execute(
      `INSERT INTO address(street_name, city_name, state_name, zip_code, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
       [street, city, state, zipCode, authentication.insertId, authentication.insertId]
    )

    // insert tuple into customer relation
    await connection.execute(
      `INSERT INTO customer(first_name, middle_name, last_name, phone_number, account_type, address_id, auth_id, created_by, updated_by)
       VALUES (?, ?, ?, ?, ? ,? ,?, ?, ?)`,
      [
        firstName, 
        toNullIfBlank(middleName), 
        lastName, 
        toNullIfBlank(phoneNumber), 
        accountType, 
        address.insertId, 
        authentication.insertId,
        authentication.insertId,
        authentication.insertId
      ]
    )

    // commit transaction on success
    await connection.commit()

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
            success: true,
            message: 'Sign up successful',
    })) 

  } catch (error) {
    await connection.rollback() 
    console.error('Transaction failed', error)
    badServerRequest(res)
  } finally {
    connection.release()
  }
}

