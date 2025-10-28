import { loginController } from '../controllers/loginController.js'
import { emailCheckController } from '../controllers/emailCheckController.js'
import { userSignUpController } from '../controllers/userSignUpController.js'
import { createTrackingEventsController } from '../controllers/createTrackingEventsController.js'
import { addEmployeeController } from '../controllers/addEmployeeController.js'
import { updateEmployeeController } from '../controllers/updateEmployeeController.js'
import { addFacilityController } from '../controllers/addFacilityController.js'
import { updateFacilityController } from '../controllers/updateFacilityController.js'

export const handlePostRequest= (req, res) => {

  // check login
  if ( req.url.startsWith('/login') ) {
    return loginController(req, res)
  }
  // check if email is valid when signing up
  else if ( req.url.startsWith('/checkEmail') ) {
    return emailCheckController(req, res)
  }
  // adds new tuple in address, authentication, and customer entities according to user sign up
  else if ( req.url.startsWith('/userSignUp') ) {
    return userSignUpController(req, res)
  }
  // create tracking events for moving packages between facilities
  else if ( req.url.startsWith('/createTrackingEvents') ) {
    return createTrackingEventsController(req, res)
  }
  // add new employee
  else if ( req.url.startsWith('/addEmployee') ) {
    return addEmployeeController(req, res)
  }
  // update employee field
  else if ( req.url.startsWith('/updateEmployee') ) {
    return updateEmployeeController(req, res)
  }
  // add new facility
  else if ( req.url.startsWith('/addFacility') ) {
    return addFacilityController(req, res)
  }
  // update facility field
  else if ( req.url.startsWith('/updateFacility') ) {
    return updateFacilityController(req, res)
  }
  // if an api call is made to a url that isn't any of the above, return 404
  else {
    res.statusCode = 404
    res.end("URL not found")
  }
}
