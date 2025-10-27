import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from "react";

import Home from './pages/Home';
import LoginOrSignUp from './pages/LogInOrSignUp';
import CustomerPage from './pages/CustomerPage';
import EmployeePage from './pages/EmployeePage';
import ManagerPage from './pages/ManagerPage';

import UserProfile from './pages/UserProfile';
import UserShipping from './pages/UserShipping';
import UserTrackPackage from './pages/UserTrackPackage';

const Shipping = lazy( () => import('./pages/Shipping'));
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
        location.pathname === "/shipping"      ||
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
          <Route path="/shipping" element={<Shipping/>} />
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
            <Route path='/managerPage' element={<ManagerPage globalAuthId={globalAuthId}/>} />
            <Route path='/userProfile' element={<UserProfile/>} />
            <Route path='/userShipping' element={<UserShipping globalAuthId={globalAuthId}/>} />
            <Route path='/userTrackPackage' element={<UserTrackPackage/>} />
          </Route>
    
        </Routes>
      </Suspense>
      </main>

      <Footer />
    </>
  );
};

export default App;
