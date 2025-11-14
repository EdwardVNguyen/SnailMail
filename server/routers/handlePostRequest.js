import { loginController } from '../controllers/loginController.js'
import { emailCheckController } from '../controllers/emailCheckController.js'
import { userSignUpController } from '../controllers/userSignUpController.js'
import { createTrackingEventsController } from '../controllers/createTrackingEventsController.js'
import { addEmployeeController } from '../controllers/addEmployeeController.js'
import { updateEmployeeController } from '../controllers/updateEmployeeController.js'
import { deleteEmployeeController } from '../controllers/deleteEmployeeController.js'
import { addFacilityController } from '../controllers/addFacilityController.js'
import { updateFacilityController } from '../controllers/updateFacilityController.js'
import { deleteFacilityController } from '../controllers/deleteFacilityController.js'
import { createShipmentController } from '../controllers/createShipmentController.js'
import { createPackageController } from '../controllers/createPackageController.js'
import { requestPackageController } from '../controllers/requestPackageController.js'
import { approveCourierRequestController } from '../controllers/approveCourierRequestController.js'
import { rejectCourierRequestController } from '../controllers/rejectCourierRequestController.js'
import { confirmDeliveryController } from '../controllers/confirmDeliveryController.js'

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
  // delete employee
  else if ( req.url.startsWith('/deleteEmployee') ) {
    return deleteEmployeeController(req, res)
  }
  // delete facility
  else if ( req.url.startsWith('/deleteFacility') ) {
    return deleteFacilityController(req, res)
  }
  // create new shipment
  else if (req.url.startsWith('/createShipment')) {
    return createShipmentController(req, res)
  }
  // create package for guest users
  else if (req.url.startsWith('/createPackage')) {
    return createPackageController(req, res)
  }
  // courier requests a package
  else if (req.url.startsWith('/requestPackage')) {
    return requestPackageController(req, res)
  }
  // clerk approves courier request
  else if (req.url.startsWith('/approveCourierRequest')) {
    return approveCourierRequestController(req, res)
  }
  // clerk rejects courier request
  else if (req.url.startsWith('/rejectCourierRequest')) {
    return rejectCourierRequestController(req, res)
  }
  // courier confirms delivery
  else if (req.url.startsWith('/confirmDelivery')) {
    return confirmDeliveryController(req, res)
  }
  // if an api call is made to a url that isn't any of the above, return 404
  else {
    res.statusCode = 404
    res.end("URL not found")
  }
}
