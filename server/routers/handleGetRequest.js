import { getCustomerDataController } from '../controllers/getCustomerDataController.js'
import { getCustomerPackageDataController } from '../controllers/getCustomerPackageDataController.js'
import { getAddressDataController } from '../controllers/getAddressDataController.js'
import { getFacilitiesController } from '../controllers/getFacilitiesController.js'
import { getPackagesByFacilityController } from '../controllers/getPackagesByFacilityController.js'
import { getEmployeeIdController } from '../controllers/getEmployeeIdController.js'

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
  }
  // if an api call is made to a url that isn't any of the above, return 404
  else {
    res.statusCode = 404
    res.end("URL not found")
  }
}
