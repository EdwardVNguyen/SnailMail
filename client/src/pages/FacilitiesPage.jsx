import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserShipping.css';
import './FacilitiesPage.css';
import { isValidZipCode, isValidState } from '../utils/validation';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { encodeFacilityId, encodeEmployeeId } from '../utils/idEncoder';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const FacilitiesPage = ({ globalAuthId }) => {
  const authId = globalAuthId;
  const navigate = useNavigate();

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingFacility, setDeletingFacility] = useState(null);

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

  // Edit form state
  const [editFacilityName, setEditFacilityName] = useState('');
  const [editFacilityType, setEditFacilityType] = useState('post_office');
  const [editStatus, setEditStatus] = useState('active');
  const [editSelectedDays, setEditSelectedDays] = useState(new Set(['monday']));
  const [editOpeningHours, setEditOpeningHours] = useState('');
  const [editClosingHours, setEditClosingHours] = useState('');
  const [editManagerId, setEditManagerId] = useState('');
  const [editStreetName, setEditStreetName] = useState('');
  const [editCityName, setEditCityName] = useState('');
  const [editStateName, setEditStateName] = useState('');
  const [editZipCode, setEditZipCode] = useState('');

  // Facilities grid state
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState('facility_id');
  const [sortDirection, setSortDirection] = useState('asc');

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

  // Handle edit day checkbox toggle
  const handleEditDayToggle = (day) => {
    const newSelectedDays = new Set(editSelectedDays);
    if (newSelectedDays.has(day)) {
      newSelectedDays.delete(day);
    } else {
      newSelectedDays.add(day);
    }
    setEditSelectedDays(newSelectedDays);
  };

  // Fetch facilities on mount
  useEffect(() => {
    fetchFacilities();
  }, []);

  // Filter and sort facilities when search/filter changes
  useEffect(() => {
    let filtered = [...facilities];

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(fac => fac.facility_type === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(fac => fac.status === statusFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(fac =>
        fac.facility_name?.toLowerCase().includes(query) ||
        fac.facility_type?.toLowerCase().includes(query) ||
        fac.manager_name?.toLowerCase().includes(query) ||
        fac.city_name?.toLowerCase().includes(query) ||
        fac.street_name?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null values
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      // String comparison
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredFacilities(filtered);
  }, [facilities, typeFilter, statusFilter, searchQuery, sortField, sortDirection]);

  const fetchFacilities = async () => {
    setLoadingFacilities(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getFacilities`);
      const data = await response.json();

      if (data.success) {
        setFacilities(data.facilities);
      } else {
        console.error('Failed to fetch facilities:', data.message);
      }
    } catch (err) {
      console.error('Error fetching facilities:', err);
    } finally {
      setLoadingFacilities(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '⇅';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleEditClick = (facility) => {
    setEditingFacility(facility);
    setEditFacilityName(facility.facility_name || '');
    setEditFacilityType(facility.facility_type || 'post_office');
    setEditStatus(facility.status || 'active');
    // Parse days_of_week from comma-separated string to Set
    const daysArray = facility.days_of_week ? facility.days_of_week.split(',') : ['monday'];
    setEditSelectedDays(new Set(daysArray));
    setEditOpeningHours(facility.opening_hours || '');
    setEditClosingHours(facility.closing_hours || '');
    setEditManagerId(facility.manager_id || '');
    setEditStreetName(facility.street_name || '');
    setEditCityName(facility.city_name || '');
    setEditStateName(facility.state_name || '');
    setEditZipCode(facility.zip_code || '');
    setShowEditModal(true);
  };

  const validateForm = () => {
    // Required fields
    if (!facilityName || !facilityType || !status || selectedDays.size === 0 ||
        !openingHours || !closingHours || !streetName || !cityName || !stateName || !zipCode) {
      showErrorToast('Please fill in all required fields and select at least one day of the week.');
      return false;
    }

    // Zip code validation
    if (!isValidZipCode(zipCode)) {
      showErrorToast('Please enter a valid 5-digit zip code.');
      return false;
    }

    // State validation
    if (!isValidState(stateName)) {
      showErrorToast('Please enter a valid 2-letter state code (e.g., TX, CA).');
      return false;
    }

    // Manager ID validation (optional but if provided must be positive integer)
    if (managerId && (isNaN(managerId) || parseInt(managerId) < 0)) {
      showErrorToast('Please enter a valid manager ID.');
      return false;
    }

    return true;
  };

  const validateEditForm = () => {
    // Required fields
    if (!editFacilityName || !editFacilityType || !editStatus || editSelectedDays.size === 0 ||
        !editOpeningHours || !editClosingHours || !editStreetName || !editCityName || !editStateName || !editZipCode) {
      showErrorToast('Please fill in all required fields and select at least one day of the week.');
      return false;
    }

    // Zip code validation
    if (!isValidZipCode(editZipCode)) {
      showErrorToast('Please enter a valid 5-digit zip code.');
      return false;
    }

    // State validation
    if (!isValidState(editStateName)) {
      showErrorToast('Please enter a valid 2-letter state code (e.g., TX, CA).');
      return false;
    }

    // Manager ID validation (optional but if provided must be positive integer)
    if (editManagerId && (isNaN(editManagerId) || parseInt(editManagerId) < 0)) {
      showErrorToast('Please enter a valid manager ID.');
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

        setShowAddModal(false);
        fetchFacilities();
        showSuccessToast('Facility added successfully!');
      }
      else {
        showErrorToast('Error adding facility: ' + data.message);
      }
    }
    catch (err) {
      console.error('Error adding facility:', err);
      showErrorToast('Error adding facility.');
    }
    finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validateEditForm()) {
      return;
    }

    setLoading(true);

    try {
      // Convert Set to comma-separated string for MySQL SET type
      const daysOfWeekString = Array.from(editSelectedDays).join(',');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/updateFacilityFull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: editingFacility.facility_id,
          facilityName: editFacilityName,
          facilityType: editFacilityType,
          status: editStatus,
          daysOfWeek: daysOfWeekString,
          openingHours: editOpeningHours,
          closingHours: editClosingHours,
          managerId: editManagerId ? parseInt(editManagerId) : null,
          streetName: editStreetName,
          cityName: editCityName,
          stateName: editStateName,
          zipCode: editZipCode,
          updatedBy: authId
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowEditModal(false);
        setEditingFacility(null);
        fetchFacilities();
        showSuccessToast('Facility updated successfully!');
      } else {
        showErrorToast('Error updating facility: ' + data.message);
      }
    } catch (err) {
      console.error('Error updating facility:', err);
      showErrorToast('Error updating facility.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (facility) => {
    setDeletingFacility(facility);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/deleteFacility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: deletingFacility.facility_id,
          deletedBy: authId
        })
      });

      const data = await response.json();

      if (data.success) {
        fetchFacilities();
        showSuccessToast('Facility deleted successfully!');
      } else {
        showErrorToast(data.message || 'Error deleting facility.');
      }
    } catch (err) {
      console.error('Error deleting facility:', err);
      showErrorToast('Error deleting facility.');
    } finally {
      setShowDeleteModal(false);
      setDeletingFacility(null);
    }
  };

  const handleToggleStatus = async (facility) => {
    const newStatus = facility.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/toggleFacilityStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: facility.facility_id,
          status: newStatus
        })
      });

      const data = await response.json();

      if (data.success) {
        fetchFacilities();
      } else {
        console.error('Error updating facility status:', data.message);
      }
    } catch (err) {
      console.error('Error updating facility status:', err);
    }
  };

  return (
    <div className="create-package-container">
      <div className="facility-page-header">
        <h1>Facilities</h1>
        <div className="facility-header-buttons">
          <button onClick={() => setShowAddModal(true)} className="facility-add-button">
            + Add Facility
          </button>
          <button onClick={() => navigate('/managerPage')} className="facility-back-button">
            ← Back to Manager
          </button>
        </div>
      </div>

      {/* Add Facility Modal */}
      <Modal show={showAddModal} title="Add New Facility" onClose={() => setShowAddModal(false)}>
        <form onSubmit={handleSubmit}>
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
              <div className="facility-form-field facility-form-field-full">
                <label>
                  Days of Week: <span className="required-asterisk">*</span>
                </label>
                <div className="days-checkbox-container">
                  {DAYS_OF_WEEK.map((day) => (
                    <label key={day} className="days-checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedDays.has(day)}
                        onChange={() => handleDayToggle(day)}
                      />
                      <span>{day}</span>
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
              <div className="facility-form-field facility-form-field-full">
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
          <div className="modal-actions">
            <button
              type="submit"
              disabled={loading}
              className="modal-submit-button"
            >
              {loading ? 'Adding...' : 'Add Facility'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="modal-cancel-button"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Facilities Table */}
      <div className="facility-edit-container">
        {/* Search and Filter Controls */}
        <div className="facility-controls">
          <div className="facility-search-container">
            <input
              type="text"
              placeholder="Search by name, type, manager, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="facility-search-input"
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="facility-filter-select"
            >
              <option value="all">All Types</option>
              <option value="warehouse">Warehouse</option>
              <option value="post_office">Post Office</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="facility-filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {loadingFacilities ? (
          <div className="facility-loading">
            Loading facilities...
          </div>
        ) : (
          <>
            <div className="facilities-table-container">
              <table className="facilities-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('facility_id')} className="sortable">
                      ID {getSortIcon('facility_id')}
                    </th>
                    <th onClick={() => handleSort('facility_name')} className="sortable">
                      Name {getSortIcon('facility_name')}
                    </th>
                    <th onClick={() => handleSort('facility_type')} className="sortable">
                      Type {getSortIcon('facility_type')}
                    </th>
                    <th onClick={() => handleSort('status')} className="sortable">
                      Status {getSortIcon('status')}
                    </th>
                    <th>
                      Days Open
                    </th>
                    <th>
                      Hours
                    </th>
                    <th onClick={() => handleSort('manager_name')} className="sortable">
                      Manager {getSortIcon('manager_name')}
                    </th>
                    <th>
                      Address
                    </th>
                    <th>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFacilities.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="empty-state">
                        {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' ? 'No facilities match your search criteria.' : 'No facilities found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredFacilities.map(facility => (
                      <tr key={facility.facility_id}>
                        <td>{encodeFacilityId(facility.facility_id)}</td>
                        <td>{facility.facility_name}</td>
                        <td className="capitalize">{facility.facility_type?.replace('_', ' ')}</td>
                        <td>
                          <button
                            onClick={() => handleToggleStatus(facility)}
                            className="facility-toggle-btn"
                            style={{ backgroundColor: facility.status === 'active' ? '#3C467B' : '#6b7280' }}
                          >
                            {facility.status === 'active' ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td>{facility.days_of_week?.split(',').map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}</td>
                        <td>{facility.opening_hours} - {facility.closing_hours}</td>
                        <td>{facility.manager_name || 'N/A'}</td>
                        <td>
                          {facility.street_name}, {facility.city_name}, {facility.state_name} {facility.zip_code}
                        </td>
                        <td>
                          <div className="facility-table-actions">
                            <button
                              onClick={() => handleEditClick(facility)}
                              className="facility-edit-btn"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(facility)}
                              className="facility-delete-btn"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="facility-table-stats">
              Showing {filteredFacilities.length} of {facilities.length} facilities. Click column headers to sort.
            </p>
          </>
        )}
      </div>

      {/* Edit Facility Modal */}
      <Modal
        show={showEditModal && editingFacility !== null}
        title={editingFacility ? `Edit Facility ${encodeFacilityId(editingFacility.facility_id)}` : 'Edit Facility'}
        onClose={() => setShowEditModal(false)}
      >
        <form onSubmit={handleEditSubmit}>
              <div className="facility-form-grid">
                {/* Facility Type */}
                <div className="facility-form-field">
                  <label>
                    Facility Type: <span className="required-asterisk">*</span>
                  </label>
                  <select
                    value={editFacilityType}
                    onChange={(e) => setEditFacilityType(e.target.value)}
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
                    value={editFacilityName}
                    onChange={(e) => setEditFacilityName(e.target.value)}
                    required
                  />
                </div>

                {/* Status */}
                <div className="facility-form-field">
                  <label>
                    Status: <span className="required-asterisk">*</span>
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Days of Week */}
                <div className="facility-form-field facility-form-field-full">
                  <label>
                    Days of Week: <span className="required-asterisk">*</span>
                  </label>
                  <div className="days-checkbox-container">
                    {DAYS_OF_WEEK.map((day) => (
                      <label key={day} className="days-checkbox-label">
                        <input
                          type="checkbox"
                          checked={editSelectedDays.has(day)}
                          onChange={() => handleEditDayToggle(day)}
                        />
                        <span>{day}</span>
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
                    value={editManagerId}
                    onChange={(e) => setEditManagerId(e.target.value)}
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
                    value={editOpeningHours}
                    onChange={(e) => setEditOpeningHours(e.target.value)}
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
                    value={editClosingHours}
                    onChange={(e) => setEditClosingHours(e.target.value)}
                    required
                  />
                </div>

                {/* Street Name */}
                <div className="facility-form-field facility-form-field-full">
                  <label>
                    Street Address: <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="text"
                    value={editStreetName}
                    onChange={(e) => setEditStreetName(e.target.value)}
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
                    value={editCityName}
                    onChange={(e) => setEditCityName(e.target.value)}
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
                    value={editStateName}
                    onChange={(e) => setEditStateName(e.target.value.toUpperCase())}
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
                    value={editZipCode}
                    onChange={(e) => setEditZipCode(e.target.value)}
                    placeholder="12345"
                    maxLength="5"
                    required
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="modal-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="modal-submit-button"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="modal-cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={showDeleteModal && deletingFacility !== null}
        entityType="Facility"
        entityName={deletingFacility ? deletingFacility.facility_name : ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />

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

export default FacilitiesPage;
