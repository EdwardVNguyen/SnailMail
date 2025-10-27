import './CustomerPage.css';
import { useState, useEffect } from 'react'
import { getCustomerData } from '../utils/getCustomerData.js'
import { useNavigate } from 'react-router-dom'

const CustomerPage = ( {globalAuthId }) => {
  const [customerInfo, setCustomerInfo] = useState(null);

  const navigate = useNavigate();

  // fetch all info from customer relation in MySQL database
  useEffect( () => {
    const fetchData = async () => {
      const data = await getCustomerData(globalAuthId);
      setCustomerInfo(data);
    };
    fetchData();
  }, []);

  if (!customerInfo) return <div>Loading...</div>

  return (
    <div className="customerPageContainer">
      <div className="subContainer1">
        <div className="profile">
          <div className="profileLeft"> 
            <b className="icon"> {customerInfo?.customer.first_name}</b>
            <em className="accountID"> Account ID: {customerInfo?.customer.customer_id}</em>
            <div className="viewProfile">  View my <span onClick={ () => navigate('/userProfile') }> profile </span> </div>
          </div>
          <div className="nearestPostOffice"> Post Office Near You</div>
        </div>
        <div className="tracker">
          <b> Tracking ID </b>
          <form className="customerPageTracker">
            <input />
            <button> Track </button>
          </form>
        </div> 
      </div>
      <div className="quickLinks">
        Quick Links
      </div>

      </div>
  );
};

export default CustomerPage;
