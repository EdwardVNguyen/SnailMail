import { loginController } from '../controllers/loginController.js'
import { emailCheckController } from '../controllers/emailCheckController.js'
import { userSignUpController } from '../controllers/userSignUpController.js'

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
  // if an api call is made to a url that isn't any of the above, return 404
  else {
    res.statusCode = 404
    res.end("URL not found")
  }
}
