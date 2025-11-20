import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import './NavBar.css';

import homeLogo from '../assets/homeLogo.svg';
import profileIcon from '../assets/profileIcon.svg';

const AuthNavBar = ( {globalAccountType, onLogout} ) => {
  const [isTiny, setIsTiny] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsTiny(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown-container')) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    setShowDropdown(false);
    if (onLogout) {
      onLogout();
    }
  };


  return (
    <header className={`header-container header  ${isTiny ? "tiny" : ""}`}>
      <nav>
        <ul>
          <li>
            {/* Routes to different page depending on account type */}
            { globalAccountType === 'courier'
            ? <NavLink to="/courierPage" ><img className="homeLogo" src={homeLogo} alt="Courier page"/></NavLink>
            : globalAccountType === 'clerk'
            ? <NavLink to="/employeePage" ><img className="homeLogo" src={homeLogo} alt="Clerk page"/></NavLink>
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

          {/* Show courier links for couriers, clerk links for clerks, manager links for managers, other links for customers */}
          {globalAccountType === 'courier' ? (
            <>
              <li>
                <NavLink to="/courierPackage">Packages</NavLink>
              </li>
            </>
          ) : globalAccountType === 'clerk' ? (
            <>
              <li>
                <NavLink to="/clerkCourierApproval">Courier Requests</NavLink>
              </li>
            </>
          ) : globalAccountType === 'manager' ? (
            <>
              <li>
                <NavLink to="/employeesPage">Employees</NavLink>
              </li>
              <li>
                <NavLink to="/facilitiesPage">Facilities</NavLink>
              </li>
              <li>
                <NavLink to="/reportPage">Reports</NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/userShipping">Your Shipments</NavLink>
              </li>
              <li>
                <NavLink to="/userCreateShipment"> Create Shipments</NavLink>
              </li>
              <li>
                <NavLink to="/userTrackPackage">Tracking</NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
      <nav>
        <ul>
          <li className="profile-dropdown-container">
            <button
              className="profile-button"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span>Profile</span>
              <img className="profileIcon" src={profileIcon} alt="Profile icon"/>
              <span className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
            </button>

            {showDropdown && (
              <div className="profile-dropdown">
                <NavLink
                  to={['manager', 'clerk', 'courier'].includes(globalAccountType) ? '/EmployeeProfilePage' : '/CustomerProfilePage'}
                  className="dropdown-item"
                  onClick={() => setShowDropdown(false)}
                >
                  <span>👤 Account</span>
                </NavLink>
                <button
                  className="dropdown-item logout-button"
                  onClick={handleLogout}
                >
                  <span>🚪 Log Out</span>
                </button>
              </div>
            )}
          </li>
         </ul>
      </nav>
    </div>
    </header>
  );
};

export default AuthNavBar;
