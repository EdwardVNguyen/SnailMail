import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import './NavBar.css';
import { FaBell } from 'react-icons/fa';

import homeLogo from '../assets/homeLogo.svg';
import profileIcon from '../assets/profileIcon.svg';

const AuthNavBar = ( {globalAccountType, onLogout} ) => {
  const [isTiny, setIsTiny] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();

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
      if (!event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };
    if (showDropdown || showNotifications) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown, showNotifications]);

  // Fetch notifications for managers
  useEffect(() => {
    if (globalAccountType === 'manager') {
      const authId = sessionStorage.getItem('authId');
      if (authId) {
        fetchNotifications(authId);
      }
    }
  }, [globalAccountType]);

  // Refresh notifications on page navigation
  useEffect(() => {
    if (globalAccountType === 'manager') {
      const authId = sessionStorage.getItem('authId');
      if (authId) {
        fetchNotifications(authId);
      }
    }
  }, [location.pathname]);

  const fetchNotifications = async (authId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getManagerNotifications?authId=${authId}`);
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (emailId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/markNotificationRead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId })
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(notifications.filter(n => n.email_id !== emailId));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

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
          {/* Notification bell for managers */}
          {globalAccountType === 'manager' && (
            <li className="notification-container">
              <button
                className="notification-button"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell className="bell-icon" />
                {notifications.length > 0 && (
                  <span className="notification-badge">{notifications.length}</span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <span>Notifications</span>
                    <button
                      className="notification-refresh"
                      onClick={() => {
                        const authId = sessionStorage.getItem('authId');
                        if (authId) fetchNotifications(authId);
                      }}
                    >
                      ↻
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="notification-empty">No new notifications</div>
                  ) : (
                    notifications.map(notification => (
                      <div key={notification.email_id} className="notification-item">
                        <button
                          className="notification-dismiss"
                          onClick={() => markAsRead(notification.email_id)}
                        >
                          ✕
                        </button>
                        <div className="notification-content">
                          <div className="notification-subject">{notification.subject}</div>
                          <div className="notification-body">{notification.body}</div>
                          <div className="notification-time">
                            {new Date(notification.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </li>
          )}

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
