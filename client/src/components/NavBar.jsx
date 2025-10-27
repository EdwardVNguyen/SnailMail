import { NavLink } from "react-router-dom";
import homeLogo from '../assets/homeLogo.svg';
import profileIcon from '../assets/profileIcon.svg'
import './NavBar.css';
import { useEffect, useState } from "react";

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
              <NavLink to="/shipping">Shipping</NavLink> 
            </li>
            <li>
              <NavLink to="/tracking">Tracking</NavLink>
            </li>
            <li>
              <NavLink to="/testquery">Test Query</NavLink>
            </li>
            <li>
              <NavLink to="/createpackage">Create Package</NavLink>
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
