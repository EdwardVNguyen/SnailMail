import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import './NavBar.css';

import homeLogo from '../assets/homeLogo.svg';
import profileIcon from '../assets/profileIcon.svg';

const AuthNavBar = ( {globalAccountType} ) => {
  const [isTiny, setIsTiny] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsTiny(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`header-container header  ${isTiny ? "tiny" : ""}`}>
      <nav>
        <ul>
          <li>
            {/* Routes to different page depending on account type */}
            { (globalAccountType === 'courier' || globalAccountType === 'clerk')
            ? <NavLink to="/employeePage" ><img className="homeLogo" src={homeLogo} alt="Employee page"/></NavLink>  
            : globalAccountType === 'manager'
              ? <NavLink to="/managerPage" ><img className="homeLogo" src={homeLogo} alt="Manager page"/></NavLink> 
              : <NavLink to="/customerPage" ><img className="homeLogo" src={homeLogo} alt="Customer page"/></NavLink> 
            }
          </li>
        </ul>
      </nav>
      <div className="navigation">
      <nav>
        <ul>
          <li>
            <NavLink to="/about">About</NavLink> 
          </li>
          <li>
            <NavLink to="/support">Support</NavLink> 
          </li>

          <li>
            <NavLink to="/userShipping">Your Shipments</NavLink> 
          </li>
          <li>
            <NavLink to="/userTrackPackage">Tracking</NavLink> 
          </li>
        </ul>
      </nav>
      <nav>
        <ul>
          <li>
            <NavLink to="/userProfile" className="signInOrLogIn"> 
              <span>Profile</span>
              <img className="profileIcon" src={profileIcon} alt="Profile icon"/>
            </NavLink> 
          </li>
         </ul>
      </nav>
    </div>
    </header>
  );
};

export default AuthNavBar;
