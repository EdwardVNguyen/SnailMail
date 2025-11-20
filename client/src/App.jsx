import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from "react";

import Home from './pages/Home';
import LoginOrSignUp from './pages/LogInOrSignUp';
import CustomerPage from './pages/CustomerPage';
import EmployeePage from './pages/EmployeePage';
import CourierPage from './pages/CourierPage';
import ManagerPage from './pages/ManagerPage';

import CustomerProfilePage from './pages/CustomerProfilePage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import UserProfile from './pages/UserProfile';
import UserShipping from './pages/UserShipping';
import UserTrackPackage from './pages/UserTrackPackage';
import CreatePackage from './pages/CreatePackage';
import UserCreateShipment from './pages/UserCreateShipment';
import MovePackages from './pages/MovePackages';
import ReportPage from './pages/ReportPage';
import EmployeesPage from './pages/EmployeesPage';
import FacilitiesPage from './pages/FacilitiesPage';
import CourierPackagePage from './pages/CourierPackagePage';
import ClerkCourierApprovalPage from './pages/ClerkCourierApprovalPage';

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
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation();

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const storedAuthId = localStorage.getItem('authId');
    const storedAccountType = localStorage.getItem('accountType');

    if (storedAuthId && storedAccountType) {
      setAuth(true);
      setGlobalAuthId(storedAuthId);
      setGlobalAccountType(storedAccountType);
    }
    setIsLoading(false);
  }, []);

  // anytime user goes to a non-protected route, then set authetnication false (as if they logged out)
  useEffect( () => {
    const storedAuthId = localStorage.getItem('authId');
    if (!storedAuthId && (location.pathname === "/" ||
        location.pathname === "/loginorsignup" ||
        location.pathname === "/tracking"      
        )) {
      setAuth(false);
    }
  }, [location]);

  // Check if user is logged in
  useEffect(() => {
    const authId = localStorage.getItem('authId');
    const accountType = localStorage.getItem('accountType');
    if (authId) {
      setGlobalAuthId(authId);
      setGlobalAccountType(accountType);
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authId');
    localStorage.removeItem('accountType');
    setAuth(false);
    setGlobalAuthId(null);
    setGlobalAccountType(null);
    // Redirect to home/login page
    window.location.href = '/';
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {auth ? <AuthNavBar globalAccountType={globalAccountType} onLogout={handleLogout}/> : <NavBar />}
      
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
            <Route path='/courierPackage' element={<CourierPackagePage globalAuthId={globalAuthId}/>} />
            <Route path='/clerkCourierApproval' element={<ClerkCourierApprovalPage globalAuthId={globalAuthId}/>} />
            <Route path='/managerPage' element={<ManagerPage globalAuthId={globalAuthId}/>} />
            <Route path='/CustomerProfilePage' element={<CustomerProfilePage globalAuthId={globalAuthId}/>} />
            <Route path='/EmployeeProfilePage' element={<EmployeeProfilePage globalAuthId={globalAuthId}/>} />
            {/* <Route path='/userProfile' element={<UserProfile globalAuthId={globalAuthId}/>} /> */}
            <Route path='/userShipping' element={<UserShipping globalAuthId={globalAuthId}/>} />
            <Route path='/userTrackPackage' element={<UserTrackPackage globalAuthId={globalAuthId} />} />
            <Route path='/userTrackPackage/:trackingNumber' element={<UserTrackPackage globalAuthId={globalAuthId} />} />
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
