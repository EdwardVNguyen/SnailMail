import { loginController } from '../controllers/loginController.js'
import { emailCheckController } from '../controllers/emailCheckController.js'
import { userSignUpController } from '../controllers/userSignUpController.js'
import { createTrackingEventsController } from '../controllers/createTrackingEventsController.js'
import { addEmployeeController } from '../controllers/addEmployeeController.js'
import { updateEmployeeFullController } from '../controllers/updateEmployeeFullController.js'
import { deleteEmployeeController } from '../controllers/deleteEmployeeController.js'
import { addFacilityController } from '../controllers/addFacilityController.js'
import { updateFacilityFullController } from '../controllers/updateFacilityFullController.js'
import { deleteFacilityController } from '../controllers/deleteFacilityController.js'
import { createShipmentController } from '../controllers/createShipmentController.js'
import { createPackageController } from '../controllers/createPackageController.js'
import { updateCustomerInfoController } from '../controllers/updateCustomerInfoController.js'
import { updateEmployeeInfoController } from '../controllers/updateEmployeeInfoController.js'
import { getMyCourierPackagesController } from '../controllers/getMyCourierPackagesController.js'
import { getAvailablePackagesForCourierController } from '../controllers/getAvailablePackagesForCourierController.js'
import { pickupPackageController } from '../controllers/pickupPackageController.js'
import { deliverPackageController } from '../controllers/deliverPackageController.js'
import { createTrackingEventController } from '../controllers/clerk/createTrackingEventController.js'
import { createCourierRequestController } from '../controllers/createCourierRequestController.js'
import { approveCourierRequestController } from '../controllers/approveCourierRequestController.js'
import { rejectCourierRequestController } from '../controllers/rejectCourierRequestController.js'
import { markPackagesDeliveredController } from '../controllers/markPackagesDeliveredController.js'
import { updatePackageDimensionsController } from '../controllers/updatePackageDimensionsController.js'
import { updateCustomerController } from '../controllers/updateCustomerController.js'
import { updateSecurityController } from '../controllers/updateSecurityController.js'

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
  // update employee full (all fields)
  else if ( req.url.startsWith('/updateEmployeeFull') ) {
    return updateEmployeeFullController(req, res)
  }
  // add new facility
  else if ( req.url.startsWith('/addFacility') ) {
    return addFacilityController(req, res)
  }
  // update facility full (all fields)
  else if ( req.url.startsWith('/updateFacilityFull') ) {
    return updateFacilityFullController(req, res)
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
  // update customer information
  else if (req.url.startsWith('/updateCustomerInfo')) {
    return updateCustomerInfoController(req, res)
  }
  else if (req.url.startsWith('/updateEmployeeInfo')) {
    return updateEmployeeInfoController(req, res)
  // get available packages for courier
  }
  else if (req.url.startsWith('/getAvailablePackagesForCourier')) {
    return getAvailablePackagesForCourierController(req, res)
  }
  // get my courier packages
  else if (req.url.startsWith('/getMyCourierPackages')) {
    return getMyCourierPackagesController(req, res)
  }
  // courier picks up package
  else if (req.url.startsWith('/pickupPackage')) {
    return pickupPackageController(req, res)
  }
  // courier delivers package
  else if (req.url.startsWith('/deliverPackage')) {
    return deliverPackageController(req, res)
  }
  // clerk creates tracking event
  else if (req.url.startsWith('/createTrackingEvent')) {
    return createTrackingEventController(req, res)
  }
  // courier creates request to pick up package
  else if (req.url.startsWith('/createCourierRequest')) {
    return createCourierRequestController(req, res)
  }
  // clerk approves courier request
  else if (req.url.startsWith('/approveCourierRequest')) {
    return approveCourierRequestController(req, res)
  }
  // clerk rejects courier request
  else if (req.url.startsWith('/rejectCourierRequest')) {
    return rejectCourierRequestController(req, res)
  }
  // mark packages as delivered
  else if (req.url.startsWith('/markPackagesDelivered')) {
    return markPackagesDeliveredController(req, res)
  }
  // update package dimensions
  else if (req.url.startsWith('/updatePackageDimensions')) {
    return updatePackageDimensionsController(req, res)
  }
  // update customer contact information
  else if (req.url.startsWith('/updateCustomer')) {
    return updateCustomerController(req, res)
  }
  // update security (email/password)
  else if (req.url.startsWith('/updateSecurity')) {
    return updateSecurityController(req, res)
  }
  // if an api call is made to a url that isn't any of the above, return 404
  else {
    res.statusCode = 404
    res.end("URL not found")
  }
}
