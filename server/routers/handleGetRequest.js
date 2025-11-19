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
import { getFacilityReportController } from '../controllers/getFacilityReportController.js'
import { getFacilityDetailsController } from '../controllers/getFacilityDetailsController.js'
import { getClerkReportController } from '../controllers/getClerkReportController.js'
import { getClerkDetailsController } from '../controllers/getClerkDetailsController.js'
import { getCourierReportController } from '../controllers/getCourierReportController.js'
import { getCourierDetailsController } from '../controllers/getCourierDetailsController.js'
import { trackingController } from '../controllers/trackingController.js';
import { getOutForDeliveryPackagesController } from '../controllers/getOutForDeliveryPackagesController.js'
import { getFacilityForCustomerController } from '../controllers/getFacilityForCustomerController.js'
import { getPackagesAtFacilitiesController } from '../controllers/getPackagesAtFacilitiesController.js'
import { getPackageTrackingHistoryController } from '../controllers/clerk/getPackageTrackingHistoryController.js'
import { getPendingCourierRequestsController } from '../controllers/getPendingCourierRequestsController.js'
import { getProblemPackagesReportController } from '../controllers/getProblemPackagesReportController.js'

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
  // get facility report
  else if ( req.url.startsWith('/getFacilityReport')) {
    return getFacilityReportController(req, res)
  }
  // get facility details
  else if ( req.url.startsWith('/getFacilityDetails')) {
    return getFacilityDetailsController(req, res)
  }
  // get clerk report
  else if ( req.url.startsWith('/getClerkReport')) {
    return getClerkReportController(req, res)
  }
  // get clerk details
  else if ( req.url.startsWith('/getClerkDetails')) {
    return getClerkDetailsController(req, res)
  }
  // get courier report
  else if ( req.url.startsWith('/getCourierReport')) {
    return getCourierReportController(req, res)
  }
  // get courier details
  else if ( req.url.startsWith('/getCourierDetails')) {
    return getCourierDetailsController(req, res)
  }
  // get tracking info for a package
  else if (req.url.startsWith('/tracking')) {
        return trackingController(req, res);
  }
  // get packages out for delivery from a facility
  else if (req.url.startsWith('/getOutForDeliveryPackages')) {
    return getOutForDeliveryPackagesController(req, res)
  }
  else if (req.url.startsWith('/getFacilityForCustomer')) {
    return getFacilityForCustomerController(req, res);
  }
  // get packages at facilities (for clerks)
  else if (req.url.startsWith('/getPackagesAtFacilities')) {
    return getPackagesAtFacilitiesController(req, res);
  }
  // get tracking history for a package
  else if (req.url.startsWith('/getPackageTrackingHistory')) {
    return getPackageTrackingHistoryController(req, res);
  }
  // get pending courier requests (for clerks)
  else if (req.url.startsWith('/getPendingCourierRequests')) {
    return getPendingCourierRequestsController(req, res);
  }
  // get problem packages count (for manager dashboard)
  else if (req.url.startsWith('/getProblemPackagesReport')) {
    return getProblemPackagesReportController(req, res);
  }
  // if an api call is made to a url that isn't any of the above, return 404
  else {
    res.statusCode = 404
    res.end("URL not found")
  }
}
