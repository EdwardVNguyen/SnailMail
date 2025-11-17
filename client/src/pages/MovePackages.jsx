import { useEffect, useState, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import './MovePackages.css';
import { Toast } from '../components/Toast';

import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import "ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.registerModules([AllCommunityModule]);
// Move Packages with custom event status

const MovePackages = ( {globalAuthId} ) => {
  const authId = globalAuthId;
  const navigate = useNavigate();

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
  };

  const showErrorToast = (message) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
  };

  // Provide unique row ID to maintain selection state
  const getRowId = useCallback((params) => {
    return params.data.package_id.toString();
  }, []);

  // State for facilities
  const [facilities, setFacilities] = useState([]);
  const [currentFacility, setCurrentFacility] = useState('');
  const [destinationFacility, setDestinationFacility] = useState('');

  // State for packages
  const [packages, setPackages] = useState([]);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  // State for travel time and event status
  const [travelTime, setTravelTime] = useState('');
  const [eventStatus, setEventStatus] = useState('in transit');

  // Fetch all facilities on component mount
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/getFacilities`);
        const data = await response.json();
        if (data.success) {
          setFacilities(data.facilities);
        }
      } catch (err) {
        console.error("Error fetching facilities:", err);
      }
    };
    fetchFacilities();
  }, []);

  const fetchPackagesAtFacility = async () => {
    if (!currentFacility) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/getPackagesByFacility?facilityId=${currentFacility}`
      );
      const data = await response.json();
      if (data.success) {
        setPackages(data.packages);
      } else {
        setPackages([]);
        console.error("Failed to fetch packages", data.message);
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch packages when current facility is selected
  useEffect(() => {
    if (currentFacility) {
      fetchPackagesAtFacility();
      // Reset selected packages when facility changes
      setSelectedPackages([]);
    } else {
      setPackages([]);
      setSelectedPackages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFacility]);

  // Handle package selection
  const onSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedPackages(selectedRows);
  };

  // Handle move packages submission
  const handleMovePackages = async () => {
    if (selectedPackages.length === 0) {
      showErrorToast('Please select at least one package to move.');
      return;
    }
    if (!destinationFacility) {
      showErrorToast('Please select a destination facility.');
      return;
    }
    if (!travelTime) {
      showErrorToast('Please enter estimated travel time.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/createTrackingEvents`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          packageIds: selectedPackages.map(pkg => pkg.package_id),
          destinationFacilityId: destinationFacility,
          travelTime: travelTime,
          eventStatus: eventStatus,
          authId: authId
        })
      });
      const data = await response.json();

      if (data.success) {
        showSuccessToast('Tracking events created successfully!');
        // Reset state
        setSelectedPackages([]);
        setDestinationFacility('');
        setTravelTime('');
        setEventStatus('in transit');
        // Refresh packages list
        fetchPackagesAtFacility();
      } else {
        showErrorToast('Error creating tracking events: ' + data.message);
      }
    } catch (err) {
      console.error("Error creating tracking events:", err);
      showErrorToast('Error creating tracking events.');
    }
  };

  // Row data for AG Grid
  const rowData = packages.map(pkg => ({
    package_id: pkg.package_id,
    ID: pkg.package_id,
    Sender: pkg.sender_name,
    Recipient: pkg.recipient_name,
    Type: pkg.package_type,
    Weight: pkg.weight,
    Dimensions: `${Math.round(pkg.length)}x${Math.round(pkg.width)}x${Math.round(pkg.height)}`,
    PackageStatus: pkg.package_status,
    DateCreated: new Date(pkg.created_at).toISOString().split('T')[0]
  }));

  // Column definitions
  const colDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 50,
      pinned: 'left'
    },
    {
      field: "ID",
      flex: 0.5
    },
    {
      field: "Sender",
      flex: 1
    },
    {
      field: "Recipient",
      flex: 1
    },
    {
      field: "Type",
      flex: 0.8
    },
    {
      field: "PackageStatus",
      flex: 0.9
    },
    {
      field: "Dimensions",
      headerName: "LxWxH (in cm)",
      flex: 0.8
    },
    {
      field: "Weight",
      headerName: "Weight (in kg)",
      flex: 0.7
    },
    {
      field: "DateCreated",
      flex: 0.8,
      sort: 'asc'
    }
  ];

  return (
    <div className="move-packages-container">
      <div className="move-packages-header">
        <div>
          <h1>Move Packages</h1>
          <p>Create tracking events between facilities</p>
        </div>
        <button onClick={() => navigate('/courierPage')} className="back-button">
          ← Back to Courier
        </button>
      </div>

      {/* Step 1: Select Current Facility */}
      <div className="step-card">
        <h3>Step 1: Select Current Facility Location</h3>
        <div className="form-field">
          <select
            value={currentFacility}
            onChange={(e) => setCurrentFacility(e.target.value)}
          >
            <option value="">-- Select a facility --</option>
            {facilities.map(facility => (
              <option key={facility.facility_id} value={facility.facility_id}>
                {facility.facility_name} ({facility.facility_type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Step 2: Display Packages Table with Checkboxes */}
      {currentFacility && (
        <>
          <div className="packages-grid-container">
            <div className="packages-grid-header">
              <h3>Step 2: Select Packages to Move</h3>
              <p>Selected: {selectedPackages.length} package(s)</p>
            </div>

            <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
              <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
                rowSelection="multiple"
                onSelectionChanged={onSelectionChanged}
                pagination={false}
                getRowId={getRowId}
                defaultColDef={{
                  sortable: true,
                  filter: true
                }}
              />
            </div>
          </div>

          {/* Step 3: Select Destination and Travel Time */}
          <div className="step-card">
            <h3>Step 3: Set Destination and Travel Time</h3>

            <div className="form-field">
              <label>Destination Facility:</label>
              <select
                value={destinationFacility}
                onChange={(e) => setDestinationFacility(e.target.value)}
              >
                  <option value="">-- Select destination facility --</option>
                  <option value="drop-off">Drop-off (Final Delivery)</option>
                  {facilities
                    .filter(f => f.facility_id !== parseInt(currentFacility))
                    .map(facility => (
                      <option key={facility.facility_id} value={facility.facility_id}>
                        {facility.facility_name} ({facility.facility_type})
                      </option>
                    ))}
              </select>
            </div>

            <div className="form-field">
              <label>Tracking Event Status:</label>
              <select
                value={eventStatus}
                onChange={(e) => setEventStatus(e.target.value)}
              >
                  <option value="pre-shipment">Pre-Shipment</option>
                  <option value="in transit">In Transit</option>
                  <option value="out for delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
              </select>
            </div>

            <div className="form-field">
              <label>Estimated Travel Time (hours):</label>
              <input
                type="number"
                value={travelTime}
                onChange={(e) => setTravelTime(e.target.value)}
                placeholder="e.g., 2.5"
                min="0"
                step="0.5"
              />
            </div>

            <button
              onClick={handleMovePackages}
              disabled={selectedPackages.length === 0 || !destinationFacility || !travelTime}
              className="move-packages-submit"
            >
                Create Tracking Events ({selectedPackages.length} package{selectedPackages.length !== 1 ? 's' : ''})
              </button>
            </div>
        </>
      )}

      {loading && <div className="loading-message">Loading packages...</div>}
      {!currentFacility && !loading && (
        <div className="empty-message">
          Please select a current facility location to view packages
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default MovePackages;
