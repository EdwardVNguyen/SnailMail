import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClerkCourierApprovalPage.css';

const ClerkPackagePage = ({ globalAuthId }) => {
  const authId = globalAuthId;
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('all');

  // Fetch facilities for filter
  useEffect(() => {
    fetchFacilities();
  }, []);

  // Fetch packages when facility filter changes
  useEffect(() => {
    fetchPackages();
  }, [selectedFacility]);

  const fetchFacilities = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getFacilities?status=active`);
      const data = await response.json();
      if (data.success) {
        setFacilities(data.facilities);
      }
    } catch (err) {
      console.error('Error fetching facilities:', err);
    }
  };

  const fetchPackages = async () => {
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_API_URL}/getPackagesAtFacilities`;
      if (selectedFacility !== 'all') {
        url += `?facilityId=${selectedFacility}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setPackages(data.packages);
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clerk-package-container">
      <div className="clerk-header">
        <h1>Package Management</h1>
        <button onClick={() => navigate('/clerkPage')} className="back-button">
          ← Back
        </button>
      </div>

      {/* Facility Filter */}
      <div className="filter-section">
        <label>Filter by Facility:</label>
        <select value={selectedFacility} onChange={(e) => setSelectedFacility(e.target.value)}>
          <option value="all">All Facilities</option>
          {facilities.map((facility) => (
            <option key={facility.facility_id} value={facility.facility_id}>
              {facility.facility_name} ({facility.city_name}, {facility.state_name})
            </option>
          ))}
        </select>
      </div>

      {/* Packages Table */}
      <div className="packages-section">
        <h2>Packages at Facilities</h2>
        {loading ? (
          <p>Loading packages...</p>
        ) : packages.length === 0 ? (
          <p>No packages found.</p>
        ) : (
          <div className="table-container">
            <table className="packages-table">
              <thead>
                <tr>
                  <th>Package ID</th>
                  <th>Tracking Number</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Current Location</th>
                  <th>Status</th>
                  <th>Weight (kg)</th>
                  <th>Courier</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.package_id}>
                    <td>{pkg.package_id}</td>
                    <td className="tracking-number">{pkg.tracking_number}</td>
                    <td>{pkg.sender_name}</td>
                    <td>{pkg.recipient_name}</td>
                    <td>{pkg.facility_name || 'Unknown'}</td>
                    <td>
                      <span className={`status-badge status-${pkg.package_status}`}>
                        {pkg.package_status}
                      </span>
                    </td>
                    <td>{pkg.weight}</td>
                    <td>{pkg.courier_name || 'Not Assigned'}</td>
                    <td>{new Date(pkg.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClerkPackagePage;
