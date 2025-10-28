import { getCustomerDataController } from '../controllers/getCustomerDataController.js'
import { getCustomerPackageDataController } from '../controllers/getCustomerPackageDataController.js'
import { getAddressDataController } from '../controllers/getAddressDataController.js'
import { getFacilitiesController } from '../controllers/getFacilitiesController.js'
import { getPackagesByFacilityController } from '../controllers/getPackagesByFacilityController.js'
import { getEmployeeIdController } from '../controllers/getEmployeeIdController.js'
import { getNextEmployeeIdController } from '../controllers/getNextEmployeeIdController.js'
import { getEmployeesController } from '../controllers/getEmployeesController.js'
import { checkEmployeeUniquenessController } from '../controllers/checkEmployeeUniquenessController.js'
import { getNextFacilityIdController } from '../controllers/getNextFacilityIdController.js'
import { checkFacilityUniquenessController } from '../controllers/checkFacilityUniquenessController.js'
import { getProblemsReportController } from '../controllers/getProblemsReportController.js'
import { getFacilityBacklogReportController } from '../controllers/getFacilityBacklogReportController.js'
import { getDeliveryTimeReportController } from '../controllers/getDeliveryTimeReportController.js'
import { getCourierPerformanceReportController } from '../controllers/getCourierPerformanceReportController.js'

export const handleGetRequest = (req, res) => {

  // get all info from customer relation
  if ( req.url.startsWith('/getCustomerData') ) {
    return getCustomerDataController(req, res)
  // get all info from package relation
  } else if ( req.url.startsWith('/getCustomerPackageData')){
    return getCustomerPackageDataController(req, res)
  // get all info from address relation
  } else if ( req.url.startsWith('/getAddressData')) {
    return getAddressDataController(req, res)
  // get all facilities
  } else if ( req.url.startsWith('/getFacilities')) {
    return getFacilitiesController(req, res)
  // get packages by facility location
  } else if ( req.url.startsWith('/getPackagesByFacility')) {
    return getPackagesByFacilityController(req, res)
  // get employee_id from auth_id
  } else if ( req.url.startsWith('/getEmployeeId')) {
    return getEmployeeIdController(req, res)
  // get next available employee_id
  } else if ( req.url.startsWith('/getNextEmployeeId')) {
    return getNextEmployeeIdController(req, res)
  // get all employees or filter by role
  } else if ( req.url.startsWith('/getEmployees')) {
    return getEmployeesController(req, res)
  // check employee ID or SSN uniqueness
  } else if ( req.url.startsWith('/checkEmployeeUniqueness')) {
    return checkEmployeeUniquenessController(req, res)
  // get next available facility_id
  } else if ( req.url.startsWith('/getNextFacilityId')) {
    return getNextFacilityIdController(req, res)
  // check facility ID uniqueness
  }
  else if ( req.url.startsWith('/checkFacilityUniqueness')) {
    return checkFacilityUniquenessController(req, res)
  }
  // get problem packages report
  else if ( req.url.startsWith('/getProblemsReport')) {
    return getProblemsReportController(req, res)
  }
  // get facility backlog report
  else if ( req.url.startsWith('/getFacilityBacklogReport')) {
    return getFacilityBacklogReportController(req, res)
  }
  // get delivery time report
  else if ( req.url.startsWith('/getDeliveryTimeReport')) {
    return getDeliveryTimeReportController(req, res)
  }
  // get courier performance report
  else if ( req.url.startsWith('/getCourierPerformanceReport')) {
    return getCourierPerformanceReportController(req, res)
  }
  // if an api call is made to a url that isn't any of the above, return 404
  else {
    res.statusCode = 404
    res.end("URL not found")
  }
}
