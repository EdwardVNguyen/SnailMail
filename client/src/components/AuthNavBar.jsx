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

  // Fetch notifications for all users
  useEffect(() => {
    const authId = sessionStorage.getItem('authId');
    if (authId) {
      fetchNotifications(authId);
    }
  }, [globalAccountType]);

  // Refresh notifications on page navigation
  useEffect(() => {
    const authId = sessionStorage.getItem('authId');
    if (authId) {
      fetchNotifications(authId);
    }
  }, [location.pathname]);

  const fetchNotifications = async (authId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getNotifications?authId=${authId}`);
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const userType = globalAccountType === 'customer' ? 'customer' : 'employee';
      const response = await fetch(`${import.meta.env.VITE_API_URL}/markNotificationRead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, userType })
      });
      const data = await response.json();
      if (data.success) {
        // Remove notification from local state
        setNotifications(notifications.filter(n => n.notification_id !== notificationId));
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

    // Format time ago helper
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

   // Determine if this user type should see notifications
  const isCustomer = globalAccountType === 'customer';
  const isEmployee = ['manager', 'clerk', 'courier'].includes(globalAccountType);

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
          {/* Notification bell for all users */}
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
                      <div key={notification.notification_id || notification.log_id} className="notification-item">
                        <button
                          className="notification-dismiss"
                          onClick={() => markAsRead(notification.notification_id)}
                        >
                          ✕
                        </button>
                        <div className="notification-content">
                          {/* Customer notifications */}
                          {isCustomer && (
                            <>
                              <div className="notification-subject">{notification.message}</div>
                              <div className="notification-body">
                                {notification.tracking_number && (
                                  <span>Tracking: {notification.tracking_number}</span>
                                )}
                                {notification.package_status && (
                                  <span>Status: {notification.package_status}</span>
                                )}
                              </div>
                            </>
                          )}
                          {/* Employee notifications */}
                          {isEmployee && (
                            <>
                              <div className="notification-subject">{notification.tracking_number}</div>
                              <div className="notification-body">
                                {notification.employee_name && (
                                  <span>Employee: {notification.employee_name}</span>
                                )}
                                {notification.package_number && (
                                  <span>Package Number: {notification.package_number}</span>
                                )}
                                { notification.type && (
                                  <span>Status: {notification.type}</span>
                                )}
                              </div>
                            </>
                          )}
                          <div className="notification-time">
                            {formatTimeAgo(notification.created_at)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
          </li>

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
