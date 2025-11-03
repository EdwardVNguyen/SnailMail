import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import './NavBar.css';

import homeLogo from '../assets/homeLogo.svg';
import profileIcon from '../assets/profileIcon.svg'

const NavBar = () => {
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
            {/* NavLink allows to navigate different routes using the "to" prop */}
            <NavLink to="/" ><img className="homeLogo" src={homeLogo} alt="Home"/></NavLink> 
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
            <NavLink to="/createPackage">Shipping</NavLink> 
          </li>
          <li>
            <NavLink to="/tracking">Tracking</NavLink> 
          </li>
        </ul>
      </nav>
      <nav>
        <ul>
          <li>
            <NavLink to="/loginorsignup" className="signInOrLogIn"> 
              <span>Log In or Sign Up </span>
              <img className="profileIcon" src={profileIcon} alt="Profile icon"/>
            </NavLink> 
          </li>
         </ul>
      </nav>
    </div>
    </header>
  );
};

export default NavBar;
