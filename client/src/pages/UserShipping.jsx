import { useEffect, useState } from "react";

import { useNavigate } from 'react-router-dom';
import './UserShipping.css'

import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
import "ag-grid-community/styles/ag-theme-alpine.css";

import Pagination from '../utils/Pagination';

ModuleRegistry.registerModules([AllCommunityModule]);

const UserShipping = ( {globalAuthId }) => {
    const [packages, setPackages] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const navigateSupportPage = () => {
      navigate('/support');
    };
    const navigateSettingPage = () => {
      navigate('/userProfile');
    }
    const navigateCreateShipment = () => {
        navigate('/createShipment');
    }
    const navigateEShop = () => {
      navigate('/ecommercePage');
    }

    const limit = 12; // number of packages per request
    const authId = globalAuthId;

    const fetchPackages = async (pageNum = 1) => {
      setLoading(true);
      try {
        const packageRes = await fetch( `${import.meta.env.VITE_API_URL}/getCustomerPackageData?authId=${authId}&page=${pageNum}&limit=${limit}`);
        const packageData = await packageRes.json();

        if (packageData.success) {
          // Append new packages if not the first page
          setPackages(packageData.packages);
          setTotalPages(packageData.totalPages);
          setPage(pageNum);

          // Now fetch addresses for each package
          const addressPromises = packageData.packages.map(pkg =>
            fetch(`${import.meta.env.VITE_API_URL}/getAddressData?addressId=${pkg.recipient_address_id}`)
              .then(res => res.json())
              .then(data => ({ packageId: pkg.package_id, address: data.address }))
          );

          const addressesResults = await Promise.all(addressPromises);

          // Store addresses in state
          setAddresses(addressesResults);

        } else {
          console.error("Failed to fetch packages", packageData.message);
        }
      } catch (err) {
        console.error("Error fetching packages:", err);
      } finally {
        setLoading(false);
      }
    };

  // initial fetch / packages first shown to customer
  useEffect( () => {
    fetchPackages(1);
  }, [authId]);

  // Row Data: The data to be displayed.
      
  const rowData = packages.map(pkg => {
    // Find the corresponding address for this package
    const addressObj = addresses.find(a => a.packageId === pkg.package_id);
    const dropoff = addressObj ? `${addressObj.address.street_name}, 
                                  ${addressObj.address.city_name}, 
                                  ${addressObj.address.state_name}`
                                  : "Address not found";

    return {
      ID: pkg.package_id,
      Recipient: pkg.recipient_name,
      DropoffAddress: dropoff,
      Type: pkg.package_type,
      Weight: pkg.weight,
      Dimensions: `${Math.round(pkg.length)}x${Math.round(pkg.width)}x${Math.round(pkg.height)}`,
      PackageStatus: pkg.package_status,
      DateCreated: new Date(pkg.created_at).toISOString().split('T')[0],
      LastModified: new Date(pkg.last_updated).toISOString().split('T')[0]
    };
  });
  // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        { 
          field: "ID",
          flex: 0.4
        },
        { 
          field: "Type",
          flex: 0.70
        },
        { 
          field: "PackageStatus",
          flex: 0.85
        },
        { 
          field: "Recipient",
          flex: 0.85
        },
        { 
          field: "DropoffAddress",
          flex: 1.25
        },
        { 
          field: "Dimensions",
          headerName: "LxWxH (in cm)",
          flex: 0.85
        },
        { 
          field: "Weight",
          headerName: "Weight (in kg)",
          flex: 0.75,
        },
        { 
          field: "LastModified",
          flex: 0.75,
          sort: "desc" // makes the latest modfication date go on top
        },
        { 
          field: "DateCreated",
          flex: 0.75
        }
    ]);

  return (
    <div className="userShippingContainer">
      <div className="userShippingSideBar"> 
        <div/>
        <button className="userShippingBtn"> 📦 Your Shipments </button>
        <button className="userShippingBtn" onClick={navigateCreateShipment}> ✉️  Create Shipment </button>
        <button className="userShippingBtn" onClick={navigateEShop} > 🛒 E-Shop</button>
        <button className="userShippingBtn" onClick={navigateSettingPage}> ⚙️  Settings </button>
        <button className="userShippingBtn" onClick={navigateSupportPage}> 💬 Help </button>
      </div>
      <div className="userShippingRight">
        <div className="userShippingTop">
          <div className="userShippingDesc">
            SnailMail <span> Your shipments, anywhere, anytime</span>
          </div>
            <Pagination
                  currentPage={page}
                  totalCount={totalPages * limit} // total items
                  pageSize={limit}
                  onPageChange={fetchPackages}
             />
          </div>
        <div className="ag-theme-alpine" style={{ height: 550, width: "100%" }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
                pagination={false}
            />
        </div>
    </div>
      
    </div>
  );
};

export default UserShipping;
