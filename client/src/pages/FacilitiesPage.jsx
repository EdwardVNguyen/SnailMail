import { useState, useEffect, useCallback } from 'react';
import './UserShipping.css';
import './FacilitiesPage.css';

import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import "ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const FacilitiesPage = ({ globalAuthId }) => {
  const authId = globalAuthId;

  // Tab state
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'edit'

  // Form state for Add Facility
  const [facilityId, setFacilityId] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [facilityType, setFacilityType] = useState('post_office');
  const [status, setStatus] = useState('active');
  const [daysOfWeek, setDaysOfWeek] = useState('monday');
  const [openingHours, setOpeningHours] = useState('');
  const [closingHours, setClosingHours] = useState('');
  const [managerId, setManagerId] = useState('');
  const [streetName, setStreetName] = useState('');
  const [cityName, setCityName] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Edit Facilities state
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'warehouse', 'post_office'
  const [statusFilter, setStatusFilter] = useState('active'); // 'all', 'active', 'inactive'
  const [facilities, setFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [safetyLock, setSafetyLock] = useState(true); // Safety lock for ID editing
  const [deleteMode, setDeleteMode] = useState(false); // Toggle delete mode
  const [deletingFacilityId, setDeletingFacilityId] = useState(null); // Track which facility is being deleted

  const [nextFacilityId, setNextFacilityId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch the next available facility_id
  useEffect(() => {
    const fetchNextFacilityId = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/getNextFacilityId`);
        const data = await response.json();
        if (data.success) {
          setNextFacilityId(data.nextFacilityId);
          setFacilityId(data.nextFacilityId.toString());
        }
      }
      catch (err) {
        console.error('Error fetching next facility ID:', err);
      }
    };

    fetchNextFacilityId();
  }, []);

  // Fetch facilities when on edit tab (with debouncing)
  useEffect(() => {
    if (activeTab === 'edit') {
      // Debounce the fetch to prevent rapid requests
      const timeoutId = setTimeout(() => {
        fetchFacilities();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, typeFilter, statusFilter]);

  const fetchFacilities = async () => {
    setLoadingFacilities(true);
    try {
      let url = `${import.meta.env.VITE_API_URL}/getFacilities?`;
      const params = [];

      if (typeFilter !== 'all') {
        params.push(`type=${typeFilter}`);
      }
      if (statusFilter !== 'all') {
        params.push(`status=${statusFilter}`);
      }

      url += params.join('&');

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setFacilities(data.facilities);
      }
      else {
        console.error('Failed to fetch facilities:', data.message);
      }
    }
    catch (err) {
      console.error('Error fetching facilities:', err);
    }
    finally {
      setLoadingFacilities(false);
    }
  };

  // AG Grid callback for unique row IDs
  const getRowId = useCallback((params) => {
    return params.data.facility_id.toString();
  }, []);

  // Handle cell value change
  const onCellValueChanged = async (params) => {
    const updatedFacility = params.data;
    const field = params.colDef.field;
    const newValue = params.newValue;
    const oldValue = params.oldValue;

    // Check if editing ID (requires uniqueness check)
    if (field === 'facility_id') {
      // Confirm the change
      const confirmed = window.confirm(
        `Are you sure you want to change Facility ID from ${oldValue} to ${newValue}?\n\nThis will check for uniqueness before applying.`
      );

      if (!confirmed) {
        // Revert the change
        fetchFacilities();
        return;
      }

      // Check uniqueness
      try {
        const checkResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/checkFacilityUniqueness?field=${field}&value=${newValue}&currentId=${updatedFacility.facility_id}`
        );
        const checkData = await checkResponse.json();

        if (!checkData.isUnique) {
          alert(`This Facility ID is already in use. Change reverted.`);
          fetchFacilities();
          return;
        }
      }
      catch (err) {
        console.error('Error checking uniqueness:', err);
        alert('Error checking uniqueness. Change reverted.');
        fetchFacilities();
        return;
      }
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/updateFacility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: updatedFacility.facility_id,
          field: field,
          value: newValue,
          updatedBy: authId
        })
      });

      const data = await response.json();

      if (!data.success) {
        alert('Error updating facility: ' + data.message);
        // Refresh to revert changes
        fetchFacilities();
      }
    }
    catch (err) {
      console.error('Error updating facility:', err);
      alert('Error updating facility.');
      fetchFacilities();
    }
  };

  const validateForm = () => {
    // Required fields
    if (!facilityId || !facilityName || !facilityType || !status || !daysOfWeek ||
        !openingHours || !closingHours || !streetName || !cityName || !stateName || !zipCode) {
      alert('Please fill in all required fields.');
      return false;
    }

    // Zip code validation (5 digits)
    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(zipCode)) {
      alert('Please enter a valid 5-digit zip code.');
      return false;
    }

    // State validation (2 uppercase letters)
    const stateRegex = /^[A-Z]{2}$/;
    if (!stateName.match(stateRegex)) {
      alert('Please enter a valid 2-letter state code (e.g., TX, CA).');
      return false;
    }

    // Manager ID validation (optional but if provided must be positive integer)
    if (managerId && (isNaN(managerId) || parseInt(managerId) < 0)) {
      alert('Please enter a valid manager ID.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/addFacility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: parseInt(facilityId),
          facilityName,
          facilityType,
          status,
          daysOfWeek,
          openingHours,
          closingHours,
          managerId: managerId ? parseInt(managerId) : null,
          streetName,
          cityName,
          stateName,
          zipCode,
          createdBy: authId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setFacilityName('');
        setFacilityType('post_office');
        setStatus('active');
        setDaysOfWeek('monday');
        setOpeningHours('');
        setClosingHours('');
        setManagerId('');
        setStreetName('');
        setCityName('');
        setStateName('');
        setZipCode('');
        // Fetch new next facility ID
        const nextIdResponse = await fetch(`${import.meta.env.VITE_API_URL}/getNextFacilityId`);
        const nextIdData = await nextIdResponse.json();
        if (nextIdData.success) {
          setNextFacilityId(nextIdData.nextFacilityId);
          setFacilityId(nextIdData.nextFacilityId.toString());
        }
      }
      else {
        alert('Error adding facility: ' + data.message);
      }
    }
    catch (err) {
      console.error('Error adding facility:', err);
      alert('Error adding facility.');
    }
    finally {
      setLoading(false);
    }
  };

  // Handle archive facility
  const handleDeleteFacility = async (facilityId) => {
    // Prevent multiple clicks
    if (deletingFacilityId === facilityId) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to DELETE facility ID ${facilityId}?\n\nThis action cannot be undone!`
    );

    if (!confirmed) {
      return;
    }

    setDeletingFacilityId(facilityId);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/deleteFacility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: facilityId,
          deletedBy: authId
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Facility deleted successfully!');
        fetchFacilities();
      }
      else {
        alert('Error deleting facility: ' + data.message);
      }
    }
    catch (err) {
      console.error('Error deleting facility:', err);
      alert('Error deleting facility.');
    }
    finally {
      setDeletingFacilityId(null);
    }
  };

  // Column definitions for AG Grid
  const columnDefs = [
    { field: 'facility_id', headerName: 'ID', sortable: true, filter: true, editable: !safetyLock, width: 100 },
    { field: 'facility_name', headerName: 'Facility Name', sortable: true, filter: true, editable: true, flex: 1.5 },
    { field: 'facility_type', headerName: 'Type', sortable: true, filter: true, editable: true, width: 120,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['warehouse', 'post_office']
      }
    },
    { field: 'status', headerName: 'Status', sortable: true, filter: true, editable: true, width: 110,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['active', 'inactive']
      }
    },
    { field: 'days_of_week', headerName: 'Days', sortable: true, filter: true, editable: true, width: 130,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }
    },
    { field: 'opening_hours', headerName: 'Opens', sortable: true, filter: true, editable: true, width: 100 },
    { field: 'closing_hours', headerName: 'Closes', sortable: true, filter: true, editable: true, width: 100 },
    { field: 'manager_id', headerName: 'Manager ID', sortable: true, filter: true, editable: true, width: 120 },
    { field: 'manager_name', headerName: 'Manager Name', sortable: true, filter: true, editable: false, flex: 1 },
    { field: 'street_name', headerName: 'Street', sortable: true, filter: true, editable: true, flex: 1.5 },
    { field: 'city_name', headerName: 'City', sortable: true, filter: true, editable: true, width: 150 },
    { field: 'state_name', headerName: 'State', sortable: true, filter: true, editable: true, width: 80 },
    { field: 'zip_code', headerName: 'Zip', sortable: true, filter: true, editable: true, width: 100 }
  ];

  return (
    <div style={{ marginTop: '30px', width: '100%', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="userShippingTop">
          <div className="userShippingDesc">
            Facilities <span>Manage facility information</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('add')}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: activeTab === 'add' ? '#50589C' : '#e0e0e0',
              color: activeTab === 'add' ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Add Facility
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: activeTab === 'edit' ? '#50589C' : '#e0e0e0',
              color: activeTab === 'edit' ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Edit Facilities
          </button>
        </div>

        {/* Add Facility Section */}
        {activeTab === 'add' && (
        <div style={{ padding: '20px', border: '1px solid rgba(0,0,0,0.2)', marginBottom: '20px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#50589C' }}>Add Facility</h2>

          <form onSubmit={handleSubmit}>
            <div className="facility-form-grid">
              {/* Facility ID */}
              <div className="facility-form-field">
                <label>
                  Facility ID: <span className="required-asterisk">*</span>
                </label>
                <input
                  type="number"
                  value={facilityId}
                  onChange={(e) => setFacilityId(e.target.value)}
                  placeholder={nextFacilityId ? `Auto: ${nextFacilityId}` : 'Loading...'}
                  required
                />
                <small>Auto-calculated, but you can enter your own</small>
              </div>

              {/* Facility Type */}
              <div className="facility-form-field">
                <label>
                  Facility Type: <span className="required-asterisk">*</span>
                </label>
                <select
                  value={facilityType}
                  onChange={(e) => setFacilityType(e.target.value)}
                  required
                >
                  <option value="post_office">Post Office</option>
                  <option value="warehouse">Warehouse</option>
                </select>
              </div>

              {/* Facility Name */}
              <div className="facility-form-field">
                <label>
                  Facility Name: <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  required
                />
              </div>

              {/* Status */}
              <div className="facility-form-field">
                <label>
                  Status: <span className="required-asterisk">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Days of Week */}
              <div className="facility-form-field">
                <label>
                  Days of Week: <span className="required-asterisk">*</span>
                </label>
                <select
                  value={daysOfWeek}
                  onChange={(e) => setDaysOfWeek(e.target.value)}
                  required
                >
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>

              {/* Manager ID */}
              <div className="facility-form-field">
                <label>Manager ID:</label>
                <input
                  type="number"
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              {/* Opening Hours */}
              <div className="facility-form-field">
                <label>
                  Opening Hours: <span className="required-asterisk">*</span>
                </label>
                <input
                  type="time"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  required
                />
              </div>

              {/* Closing Hours */}
              <div className="facility-form-field">
                <label>
                  Closing Hours: <span className="required-asterisk">*</span>
                </label>
                <input
                  type="time"
                  value={closingHours}
                  onChange={(e) => setClosingHours(e.target.value)}
                  required
                />
              </div>

              {/* Street Name */}
              <div className="facility-form-field">
                <label>
                  Street Address: <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  required
                />
              </div>

              {/* City */}
              <div className="facility-form-field">
                <label>
                  City: <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  required
                />
              </div>

              {/* State */}
              <div className="facility-form-field">
                <label>
                  State (2 letters): <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value.toUpperCase())}
                  placeholder="TX"
                  maxLength="2"
                  required
                />
              </div>

              {/* Zip Code */}
              <div className="facility-form-field">
                <label>
                  Zip Code (5 digits): <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="12345"
                  maxLength="5"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '20px',
                padding: '12px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: loading ? '#ccc' : '#50589C',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Adding Facility...' : 'Add Facility'}
            </button>
          </form>
        </div>
        )}

        {/* Edit Facilities Section */}
        {activeTab === 'edit' && (
        <div style={{ padding: '20px', border: '1px solid rgba(0,0,0,0.2)', marginBottom: '20px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#50589C' }}>Edit Facilities</h2>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', alignItems: 'flex-start' }}>
            {/* Type Filter Dropdown */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Filter by Type:
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ padding: '8px', fontSize: '14px', minWidth: '200px' }}
              >
                <option value="all">All Types</option>
                <option value="warehouse">Warehouse</option>
                <option value="post_office">Post Office</option>
              </select>
            </div>

            {/* Status Filter Dropdown */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Filter by Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '8px', fontSize: '14px', minWidth: '200px' }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Safety Lock Toggle */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Safety Lock (ID):
              </label>
              <button
                onClick={() => setSafetyLock(!safetyLock)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: safetyLock ? '#50589C' : 'white',
                  color: safetyLock ? 'white' : '#333',
                  border: '2px solid #50589C',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  minWidth: '120px',
                  boxSizing: 'border-box'
                }}
              >
                {safetyLock ? 'Locked' : 'Unlocked'}
              </button>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {safetyLock ? 'ID cannot be edited' : 'ID can be edited'}
              </div>
            </div>

            {/* Delete Mode Toggle */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Delete Mode:
              </label>
              <button
                onClick={() => setDeleteMode(!deleteMode)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: deleteMode ? '#dc3545' : 'white',
                  color: deleteMode ? 'white' : '#333',
                  border: '2px solid #dc3545',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  minWidth: '120px',
                  boxSizing: 'border-box'
                }}
              >
                {deleteMode ? 'Enabled' : 'Disabled'}
              </button>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {deleteMode ? 'Delete mode active' : 'Delete mode inactive'}
              </div>
            </div>
          </div>

          {loadingFacilities ? (
            <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px' }}>
              Loading facilities...
            </div>
          ) : deleteMode ? (
            /* Archive Table */
            <div>
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '5px', color: '#856404' }}>
                <strong>Delete Mode:</strong> Double-click any row to delete that facility
              </div>
              <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
                <AgGridReact
                  rowData={facilities}
                  columnDefs={columnDefs}
                  defaultColDef={{
                    sortable: true,
                    filter: true,
                    editable: false
                  }}
                  getRowId={getRowId}
                  onRowDoubleClicked={(params) => handleDeleteFacility(params.data.facility_id)}
                  rowClass="archive-mode-row"
                  getRowStyle={(params) => {
                    if (deletingFacilityId === params.data.facility_id) {
                      return {
                        backgroundColor: '#f8d7da',
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        pointerEvents: 'none'
                      };
                    }
                  }}
                  readOnlyEdit={true}
                  suppressClickEdit={true}
                  pagination={true}
                  paginationPageSize={20}
                />
              </div>
            </div>
          ) : (
            <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
              <AgGridReact
                rowData={facilities}
                columnDefs={columnDefs}
                defaultColDef={{
                  sortable: true,
                  filter: true
                }}
                getRowId={getRowId}
                onCellValueChanged={onCellValueChanged}
                pagination={true}
                paginationPageSize={20}
              />
            </div>
          )}

          <p style={{ marginTop: '15px', color: '#666', fontSize: '14px' }}>
            Double-click on any cell to edit. Press Enter to save changes.
          </p>
        </div>
        )}
      </div>
    </div>
  );
};

export default FacilitiesPage;
