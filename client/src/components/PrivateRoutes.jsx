import { Navigate, Outlet } from 'react-router-dom';

// prevents any users from going into any urls without proper authentication, returns them to the home page
const PrivateRoutes = ( { auth } ) => {
  return auth ? <Outlet /> : <Navigate to="/"/>;
};

export default PrivateRoutes;
