import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourierDeliveryPage.css';
import './UserShipping.css';
import './CreatePackage.css';

const CourierDeliveryPage = ({ globalAuthId }) => {
  const authId = globalAuthId;
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState('dropoff'); // 'dropoff' or 'pickup'

  // Drop Off state
  const [selectedFacility, setSelectedFacility] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);

  // Fetch facilities on mount
  useEffect(() => {
    fetchFacilities();
  }, []);

  // Fetch packages when facility changes
  useEffect(() => {
    if (selectedFacility && activeTab === 'dropoff') {
      fetchOutForDeliveryPackages();
    }
  }, [selectedFacility, activeTab]);

  const fetchFacilities = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getFacilities`);
      const data = await response.json();
      if (data.success) {
        setFacilities(data.facilities);
      }
    } catch (err) {
      console.error('Error fetching facilities:', err);
      alert('Error fetching facilities');
    }
  };

  const fetchOutForDeliveryPackages = async () => {
    setLoadingPackages(true);
    setSelectedPackages(new Set());
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/getOutForDeliveryPackages?facilityId=${selectedFacility}`
      );
      const data = await response.json();
      if (data.success) {
        // Sort by zip code
        const sortedPackages = data.packages.sort((a, b) => {
          const zipA = a.recipient_zip || '';
          const zipB = b.recipient_zip || '';
          return zipA.localeCompare(zipB);
        });
        setPackages(sortedPackages);
      } else {
        console.error('Failed to fetch packages:', data.message);
        alert('Error fetching packages: ' + data.message);
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
      alert('Error fetching packages');
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleCheckboxChange = (packageId) => {
    const newSelected = new Set(selectedPackages);
    if (newSelected.has(packageId)) {
      newSelected.delete(packageId);
    } else {
      newSelected.add(packageId);
    }
    setSelectedPackages(newSelected);
  };

  const handleMarkAsDelivered = async () => {
    if (selectedPackages.size === 0) {
      alert('Please select at least one package to mark as delivered');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to mark ${selectedPackages.size} package(s) as delivered?`
    );

    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/markPackagesDelivered`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageIds: Array.from(selectedPackages),
          courierId: authId
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Successfully marked ${selectedPackages.size} package(s) as delivered!`);
        // Refresh the package list
        fetchOutForDeliveryPackages();
      } else {
        alert('Error marking packages as delivered: ' + data.message);
      }
    } catch (err) {
      console.error('Error marking packages as delivered:', err);
      alert('Error marking packages as delivered');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedPackages.size === packages.length) {
      // Deselect all
      setSelectedPackages(new Set());
    } else {
      // Select all
      setSelectedPackages(new Set(packages.map(pkg => pkg.package_id)));
    }
  };

  return (
    <div className="create-package-container">
      <div className="package-header">
        <h1>Courier Deliveries</h1>
        <button onClick={() => navigate('/courierPage')} className="back-button">
          ← Back to Courier
        </button>
      </div>

      {/* Separator Line */}
      <div style={{ borderTop: '1px solid #e9ecef', marginBottom: '20px' }}></div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('dropoff')}
          style={{
            padding: '10px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: activeTab === 'dropoff' ? '#50589C' : '#e0e0e0',
            color: activeTab === 'dropoff' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            minWidth: '160px'
          }}
        >
          Drop Off
        </button>
        <button
          onClick={() => setActiveTab('pickup')}
          style={{
            padding: '10px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: activeTab === 'pickup' ? '#50589C' : '#e0e0e0',
            color: activeTab === 'pickup' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            minWidth: '160px'
          }}
        >
          Pick Up
        </button>
      </div>

      {/* Drop Off Tab */}
      {activeTab === 'dropoff' && (
        <div className="courier-delivery-container">
          <h2 className="courier-delivery-header">Drop Off Packages</h2>

          {/* Facility Selector */}
          <div className="facility-selector-container">
            <label htmlFor="facility-select" className="facility-label">
              Select Facility:
            </label>
            <select
              id="facility-select"
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="facility-select"
            >
              <option value="">-- Choose a facility --</option>
              {facilities.map((facility) => (
                <option key={facility.facility_id} value={facility.facility_id}>
                  {facility.facility_name} - {facility.street_name}, {facility.city_name}, {facility.state_name}
                </option>
              ))}
            </select>
          </div>

          {/* Packages Table */}
          {selectedFacility && (
            <div className="packages-section">
              {loadingPackages ? (
                <div className="loading-message">Loading packages...</div>
              ) : packages.length === 0 ? (
                <div className="no-packages-message">
                  No packages out for delivery at this facility.
                </div>
              ) : (
                <>
                  <div className="packages-controls">
                    <button
                      onClick={handleSelectAll}
                      className="select-all-button"
                    >
                      {selectedPackages.size === packages.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={handleMarkAsDelivered}
                      disabled={selectedPackages.size === 0 || submitting}
                      className="mark-delivered-button"
                    >
                      {submitting ? 'Processing...' : `Mark as Delivered (${selectedPackages.size})`}
                    </button>
                  </div>

                  <div className="packages-table-container">
                    <table className="packages-table">
                      <thead>
                        <tr>
                          <th className="checkbox-column">
                            <input
                              type="checkbox"
                              checked={selectedPackages.size === packages.length && packages.length > 0}
                              onChange={handleSelectAll}
                            />
                          </th>
                          <th>Package ID</th>
                          <th>Tracking Number</th>
                          <th>Recipient Name</th>
                          <th>Recipient Address</th>
                          <th>City</th>
                          <th>State</th>
                          <th>Zip Code</th>
                          <th>Package Type</th>
                          <th>Weight (lbs)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {packages.map((pkg) => (
                          <tr
                            key={pkg.package_id}
                            className={selectedPackages.has(pkg.package_id) ? 'selected-row' : ''}
                          >
                            <td className="checkbox-column">
                              <input
                                type="checkbox"
                                checked={selectedPackages.has(pkg.package_id)}
                                onChange={() => handleCheckboxChange(pkg.package_id)}
                              />
                            </td>
                            <td>{pkg.package_id}</td>
                            <td>{pkg.tracking_number}</td>
                            <td>{pkg.recipient_name}</td>
                            <td>{pkg.recipient_address}</td>
                            <td>{pkg.recipient_city}</td>
                            <td>{pkg.recipient_state}</td>
                            <td className="zip-column">{pkg.recipient_zip}</td>
                            <td>{pkg.package_type}</td>
                            <td>{pkg.weight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pick Up Tab */}
      {activeTab === 'pickup' && (
        <div className="courier-delivery-container">
          <h2 className="courier-delivery-header">Pick Up Packages</h2>
          <div className="coming-soon-message">
            Pick up functionality coming soon...
          </div>
        </div>
      )}
    </div>
  );
};

export default CourierDeliveryPage;
