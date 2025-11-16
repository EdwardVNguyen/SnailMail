import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserShipping.css';
import './FacilitiesPage.css';
import './CreatePackage.css';
import { isValidZipCode, isValidState } from '../utils/validation';

import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import "ag-grid-community/styles/ag-theme-alpine.css";
import FilterPanel from '../components/FilterPanel';

ModuleRegistry.registerModules([AllCommunityModule]);

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const FacilitiesPage = ({ globalAuthId }) => {
  const authId = globalAuthId;
  const navigate = useNavigate();

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for Add Facility
  const [facilityName, setFacilityName] = useState('');
  const [facilityType, setFacilityType] = useState('post_office');
  const [status, setStatus] = useState('active');
  const [selectedDays, setSelectedDays] = useState(new Set(['monday'])); // SET type - multiple days
  const [openingHours, setOpeningHours] = useState('');
  const [closingHours, setClosingHours] = useState('');
  const [managerId, setManagerId] = useState('');
  const [streetName, setStreetName] = useState('');
  const [cityName, setCityName] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Edit Facilities state
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [facilities, setFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [safetyLock, setSafetyLock] = useState(true);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deletingFacilityId, setDeletingFacilityId] = useState(null);

  const [loading, setLoading] = useState(false);

  // Handle day checkbox toggle
  const handleDayToggle = (day) => {
    const newSelectedDays = new Set(selectedDays);
    if (newSelectedDays.has(day)) {
      newSelectedDays.delete(day);
    } else {
      newSelectedDays.add(day);
    }
    setSelectedDays(newSelectedDays);
  };

  // Fetch facilities on mount and when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFacilities();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [typeFilter, statusFilter]);

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
      const confirmed = window.confirm(
        `Are you sure you want to change Facility ID from ${oldValue} to ${newValue}?\n\nThis will check for uniqueness before applying.`
      );

      if (!confirmed) {
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
    if (!facilityName || !facilityType || !status || selectedDays.size === 0 ||
        !openingHours || !closingHours || !streetName || !cityName || !stateName || !zipCode) {
      alert('Please fill in all required fields and select at least one day of the week.');
      return false;
    }

    // Zip code validation
    if (!isValidZipCode(zipCode)) {
      alert('Please enter a valid 5-digit zip code.');
      return false;
    }

    // State validation
    if (!isValidState(stateName)) {
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
      // Convert Set to comma-separated string for MySQL SET type
      const daysOfWeekString = Array.from(selectedDays).join(',');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/addFacility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityName,
          facilityType,
          status,
          daysOfWeek: daysOfWeekString,
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
        setSelectedDays(new Set(['monday']));
        setOpeningHours('');
        setClosingHours('');
        setManagerId('');
        setStreetName('');
        setCityName('');
        setStateName('');
        setZipCode('');

        alert('Facility added successfully!');
        setShowAddModal(false);
        fetchFacilities();
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

  // Handle delete facility
  const handleDeleteFacility = async (facilityId) => {
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
    { field: 'facility_type', headerName: 'Type', sortable: true, filter: true, editable: true, flex: 0.8,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['warehouse', 'post_office']
      }
    },
    { field: 'status', headerName: 'Status', sortable: true, filter: true, editable: true, flex: 0.7,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['active', 'inactive']
      }
    },
    {
      field: 'days_of_week',
      headerName: 'Days',
      sortable: true,
      filter: true,
      editable: true,
      flex: 1.5,
      valueFormatter: (params) => {
        // Format comma-separated days for display
        if (!params.value) return '';
        return params.value.split(',').map(day =>
          day.charAt(0).toUpperCase() + day.slice(1)
        ).join(', ');
      }
    },
    { field: 'opening_hours', headerName: 'Opens', sortable: true, filter: true, editable: true, flex: 0.7 },
    { field: 'closing_hours', headerName: 'Closes', sortable: true, filter: true, editable: true, flex: 0.7 },
    { field: 'manager_id', headerName: 'Manager ID', sortable: true, filter: true, editable: true, flex: 0.8 },
    { field: 'manager_name', headerName: 'Manager Name', sortable: true, filter: true, editable: false, flex: 1.2 },
    {
      headerName: 'Address',
      sortable: true,
      filter: true,
      editable: false,
      flex: 2,
      valueGetter: (params) => {
        const { street_name, city_name, state_name, zip_code } = params.data;
        return `${street_name}, ${city_name}, ${state_name} ${zip_code}`;
      }
    }
  ];

  return (
    <div className="create-package-container">
      <div className="package-header">
        <h1>Facilities</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="add-button"
            style={{
              padding: '10px 20px',
              backgroundColor: '#3C467B',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            + Add Facility
          </button>
          <button onClick={() => navigate('/managerPage')} className="back-button">
            ← Back to Manager
          </button>
        </div>
      </div>

      {/* Separator Line */}
      <div style={{ borderTop: '1px solid #e9ecef', marginBottom: '20px' }}></div>

      {/* Add Facility Modal */}
      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h2>Add New Facility</h2>
            <form onSubmit={handleSubmit} className="facility-form-card">
            <div className="facility-form-grid">
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

              {/* Days of Week - Multiple Selection with Checkboxes */}
              <div className="facility-form-field" style={{ gridColumn: '1 / -1' }}>
                <label>
                  Days of Week: <span className="required-asterisk">*</span>
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '15px',
                  marginTop: '8px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px'
                }}>
                  {DAYS_OF_WEEK.map((day) => (
                    <label key={day} style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedDays.has(day)}
                        onChange={() => handleDayToggle(day)}
                        style={{ marginRight: '6px', cursor: 'pointer' }}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{day}</span>
                    </label>
                  ))}
                </div>
                <small>Select all days the facility is open</small>
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
              <div className="facility-form-field" style={{ gridColumn: '1 / -1' }}>
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

          {/* Modal Actions */}
          <div className="modal-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3C467B',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              {loading ? 'Adding...' : 'Add Facility'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
          </div>
        </div>
      )}

      {/* Facilities Grid */}
      <div className="facility-edit-container">
        <h2 className="facility-edit-header">Facilities</h2>

          <FilterPanel
            filters={[
              {
                label: 'Filter by Type',
                value: typeFilter,
                onChange: setTypeFilter,
                options: [
                  { value: 'all', label: 'All Types' },
                  { value: 'warehouse', label: 'Warehouse' },
                  { value: 'post_office', label: 'Post Office' }
                ]
              },
              {
                label: 'Filter by Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]
              }
            ]}
            toggles={[
              {
                label: 'Safety Lock (ID)',
                value: safetyLock,
                onToggle: () => setSafetyLock(!safetyLock),
                activeText: 'Locked',
                inactiveText: 'Unlocked',
                activeColor: '#50589C',
                helpText: {
                  active: 'ID cannot be edited',
                  inactive: 'ID can be edited'
                }
              },
              {
                label: 'Delete Mode',
                value: deleteMode,
                onToggle: () => setDeleteMode(!deleteMode),
                activeText: 'Enabled',
                inactiveText: 'Disabled',
                activeColor: '#dc3545',
                helpText: {
                  active: 'Delete mode active',
                  inactive: 'Delete mode inactive'
                }
              }
            ]}
          />

          {loadingFacilities ? (
            <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px' }}>
              Loading facilities...
            </div>
          ) : deleteMode ? (
            /* Delete Table */
            <div>
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '5px', color: '#856404' }}>
                <strong>Delete Mode:</strong> Double-click any row to delete that facility
              </div>
              <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 400px)', minHeight: '400px', width: "100%" }}>
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
            <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 400px)', minHeight: '400px', width: "100%" }}>
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
          <br />
          <strong>Note:</strong> To edit days of week in the grid, enter comma-separated values (e.g., "monday,wednesday,friday")
        </p>
      </div>
    </div>
  );
};

export default FacilitiesPage;
