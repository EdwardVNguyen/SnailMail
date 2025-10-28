import pool from '../config/database.js';
import { getJSONRequestBody } from '../utils/getJSONRequestBody.js'
import { badClientRequest, badServerRequest } from '../utils/badRequest.js'

export const emailCheckController = async (req, res) => {

  let email;
  
  try {
    const body = await getJSONRequestBody(req)
    email = body.email
  } catch (err) {
    badClientRequest(res, err)
    return
  }
  
  const sql = `SELECT * 
               FROM authentication
               WHERE LOWER(email) = LOWER(?)` 

  try {
    const [results] = await pool.execute(sql, [email])
    
        // if not email already exists in database, then user can sign up 
        if (results.length === 0) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            exists: false, 
            message: 'Email not already taken',
          })) 

        // user can't sign up with already existing email 
        } else {
          res.statusCode = 401,
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            exists: true,
            message: 'Email has already been taken'
          }))
        }
  } catch {
    badServerRequest(res)
  }
} 
