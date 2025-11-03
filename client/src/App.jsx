import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from "react";

import Home from './pages/Home';
import LoginOrSignUp from './pages/LogInOrSignUp';
import CustomerPage from './pages/CustomerPage';
import EmployeePage from './pages/EmployeePage';
import CourierPage from './pages/CourierPage';
import ManagerPage from './pages/ManagerPage';

import UserProfile from './pages/UserProfile';
import UserShipping from './pages/UserShipping';
import UserTrackPackage from './pages/UserTrackPackage';
import CreatePackage from './pages/CreatePackage';
import UserCreateShipment from './pages/UserCreateShipment';
import ElectronicShop from './pages/ElectronicShop';
import MovePackages from './pages/MovePackages';
import ReportPage from './pages/ReportPage';
import EmployeesPage from './pages/EmployeesPage';
import FacilitiesPage from './pages/FacilitiesPage';

const Tracking = lazy( () => import('./pages/Tracking'));
const About = lazy( () => import('./pages/About'));
const Support = lazy( () => import('./pages/Support'));

import NavBar from './components/NavBar';
import AuthNavBar from './components/AuthNavBar';
import Footer from './components/Footer';
import PrivateRoutes from './components/PrivateRoutes';

const App = () => {
  const [auth, setAuth] = useState(false);
  const [globalAccountType, setGlobalAccountType] = useState(null); // acount type will persist after login 
  const [globalAuthId, setGlobalAuthId] = useState(null); // account id will persist after login and sign up (so we can personalize page according to user)
  const location = useLocation();

  // anytime user goes to a non-protected route, then set authetnication false (as if they logged out)
  useEffect( () => {
    if (location.pathname === "/"              ||
        location.pathname === "/loginorsignup" ||
        location.pathname === "/tracking"      
        ) {
      setAuth(false);
    }
  }, [location]);

  return (
    <>
      {auth ? <AuthNavBar globalAccountType={globalAccountType} /> : <NavBar />}
      
      <main>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* non-protected routes */}
          <Route path="/" element={<Home/>} />
          <Route path="/createPackage" element={<CreatePackage />} />
          <Route path="/tracking" element={<Tracking/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/support" element={<Support/>} />

          {/* login / signup page can set authentication status */}
          <Route path="/loginorsignup" 
                 element={<LoginOrSignUp 
                  setAuth={setAuth} 
                  setGlobalAccountType={setGlobalAccountType} 
                  setGlobalAuthId={setGlobalAuthId}
                 />} 
           /> 

          {/* protected routes */}
          <Route element={<PrivateRoutes auth={auth} />}>
            <Route path='/customerPage' element={<CustomerPage globalAuthId={globalAuthId}/>} />
            <Route path='/employeePage' element={<EmployeePage globalAuthId={globalAuthId}/>} />
            <Route path='/courierPage' element={<CourierPage globalAuthId={globalAuthId}/>} />
            <Route path='/managerPage' element={<ManagerPage globalAuthId={globalAuthId}/>} />
            <Route path='/userProfile' element={<UserProfile />} />
            <Route path='/userShipping' element={<UserShipping globalAuthId={globalAuthId}/>} />
            <Route path='/userTrackPackage' element={<UserTrackPackage globalAuthId={globalAuthId} />} />
            <Route path='/userTrackPackage/:trackingNumber' element={<UserTrackPackage globalAuthId={globalAuthId} />} />
            <Route path='/ecommercePage' element={<ElectronicShop/>} />
            <Route path='/movePackages' element={<MovePackages globalAuthId={globalAuthId}/>} />
            <Route path='/reportPage' element={<ReportPage globalAuthId={globalAuthId}/>} />
            <Route path='/employeesPage' element={<EmployeesPage globalAuthId={globalAuthId}/>} />
            <Route path='/facilitiesPage' element={<FacilitiesPage globalAuthId={globalAuthId}/>} />
            <Route path="/userCreateShipment" element={<UserCreateShipment globalAuthId={globalAuthId}/>} />
          </Route>
    
        </Routes>
      </Suspense>
      </main>

      <Footer />
    </>
  );
};

export default App;
