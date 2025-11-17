import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserShipping.css';
import './EmployeesPage.css';
import './CreatePackage.css';

import { isValidEmail, isValidZipCode, isValidState } from '../utils/validation';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

const EmployeesPage = ({ globalAuthId }) => {
  const authId = globalAuthId;
  const navigate = useNavigate();

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState(null);

  // Form state for Add Employee
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [accountType, setAccountType] = useState('clerk');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [streetName, setStreetName] = useState('');
  const [cityName, setCityName] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [salary, setSalary] = useState('');
  const [facilityId, setFacilityId] = useState('');

  // Edit form state
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editAccountType, setEditAccountType] = useState('clerk');
  const [editEmail, setEditEmail] = useState('');
  const [editStreetName, setEditStreetName] = useState('');
  const [editCityName, setEditCityName] = useState('');
  const [editStateName, setEditStateName] = useState('');
  const [editZipCode, setEditZipCode] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editFacilityId, setEditFacilityId] = useState('');

  // Employees grid state
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState([]);

  // Sorting state
  const [sortField, setSortField] = useState('employee_id');
  const [sortDirection, setSortDirection] = useState('asc');

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  // Fetch facilities on mount
  useEffect(() => {
    fetchFacilities();
  }, []);

  // Fetch employees on mount and when filters change
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter and sort employees when search/filter changes
  useEffect(() => {
    let filtered = [...employees];

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(emp => emp.account_type === roleFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.first_name?.toLowerCase().includes(query) ||
        emp.last_name?.toLowerCase().includes(query) ||
        emp.email?.toLowerCase().includes(query) ||
        emp.facility_name?.toLowerCase().includes(query)
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

    setFilteredEmployees(filtered);
  }, [employees, roleFilter, searchQuery, sortField, sortDirection]);

  const fetchFacilities = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getFacilities`);
      const data = await response.json();
      if (data.success) {
        setFacilities(data.facilities);
        // Set default facility if available
        if (data.facilities.length > 0) {
          setFacilityId(data.facilities[0].facility_id);
        }
      }
    } catch (err) {
      console.error('Error fetching facilities:', err);
    }
  };

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/getEmployees`);
      const data = await response.json();
      if (data.success) {
        setEmployees(data.employees);
      } else {
        console.error('Failed to fetch employees:', data.message);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoadingEmployees(false);
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

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setEditFirstName(employee.first_name || '');
    setEditLastName(employee.last_name || '');
    setEditAccountType(employee.account_type || 'clerk');
    setEditEmail(employee.email || '');
    setEditStreetName(employee.street_name || '');
    setEditCityName(employee.city_name || '');
    setEditStateName(employee.state_name || '');
    setEditZipCode(employee.zip_code || '');
    setEditSalary(employee.salary || '');
    setEditFacilityId(employee.facility_id || '');
    setShowEditModal(true);
  };

  const validateForm = () => {
    // Required fields
    if (!firstName || !lastName || !accountType || !email || !password ||
        !streetName || !cityName || !stateName || !zipCode || !salary || !facilityId) {
      alert('Please fill in all required fields.');
      return false;
    }

    // Email validation
    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
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

    return true;
  };

  const validateEditForm = () => {
    // Required fields
    if (!editFirstName || !editLastName || !editAccountType || !editEmail ||
        !editStreetName || !editCityName || !editStateName || !editZipCode ||
        !editSalary || !editFacilityId) {
      alert('Please fill in all required fields.');
      return false;
    }

    // Email validation
    if (!isValidEmail(editEmail)) {
      alert('Please enter a valid email address.');
      return false;
    }

    // Zip code validation
    if (!isValidZipCode(editZipCode)) {
      alert('Please enter a valid 5-digit zip code.');
      return false;
    }

    // State validation
    if (!isValidState(editStateName)) {
      alert('Please enter a valid 2-letter state code (e.g., TX, CA).');
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/addEmployee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          accountType,
          email,
          password,
          streetName,
          cityName,
          stateName,
          zipCode,
          salary: parseFloat(salary),
          facilityId: parseInt(facilityId),
          createdBy: authId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setFirstName('');
        setLastName('');
        setAccountType('clerk');
        setEmail('');
        setPassword('');
        setStreetName('');
        setCityName('');
        setStateName('');
        setZipCode('');
        setSalary('');
        // Reset facility to first one
        if (facilities.length > 0) {
          setFacilityId(facilities[0].facility_id);
        }

        setShowAddModal(false);
        fetchEmployees(); // Refresh the list
        showSuccessToast('Employee added successfully!');
      } else {
        alert('Error adding employee: ' + data.message);
      }
    } catch (err) {
      console.error('Error adding employee:', err);
      alert('Error adding employee.');
    } finally {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/updateEmployeeFull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: editingEmployee.employee_id,
          firstName: editFirstName,
          lastName: editLastName,
          accountType: editAccountType,
          email: editEmail,
          streetName: editStreetName,
          cityName: editCityName,
          stateName: editStateName,
          zipCode: editZipCode,
          salary: parseFloat(editSalary),
          facilityId: parseInt(editFacilityId),
          updatedBy: authId
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowEditModal(false);
        setEditingEmployee(null);
        fetchEmployees(); // Refresh the list
        showSuccessToast('Employee updated successfully!');
      } else {
        alert('Error updating employee: ' + data.message);
      }
    } catch (err) {
      console.error('Error updating employee:', err);
      alert('Error updating employee.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (employee) => {
    setDeletingEmployee(employee);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/deleteEmployee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: deletingEmployee.employee_id,
          deletedBy: authId
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowDeleteModal(false);
        setDeletingEmployee(null);
        fetchEmployees();
        showSuccessToast('Employee deleted successfully!');
      } else {
        alert('Error deleting employee: ' + data.message);
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Error deleting employee.');
    }
  };

  return (
    <div className="create-package-container">
      <div className="employee-page-header">
        <h1>Employees</h1>
        <div className="employee-header-buttons">
          <button onClick={() => setShowAddModal(true)} className="employee-add-button">
            + Add Employee
          </button>
          <button onClick={() => navigate('/managerPage')} className="employee-back-button">
            ← Back to Manager
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="employee-edit-container">
        {/* Search and Filter Controls */}
        <div className="employee-controls">
          <div className="employee-search-container">
            <input
              type="text"
              placeholder="Search by name, email, or facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="employee-search-input"
            />
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="employee-filter-select"
            >
              <option value="all">All Employees</option>
              <option value="manager">Managers</option>
              <option value="clerk">Clerks</option>
              <option value="courier">Couriers</option>
            </select>
          </div>
        </div>

        {loadingEmployees ? (
          <div className="employee-loading">
            Loading employees...
          </div>
        ) : (
          <>
            <div className="employees-table-container">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('employee_id')} className="sortable">
                      ID {getSortIcon('employee_id')}
                    </th>
                    <th onClick={() => handleSort('first_name')} className="sortable">
                      First Name {getSortIcon('first_name')}
                    </th>
                    <th onClick={() => handleSort('last_name')} className="sortable">
                      Last Name {getSortIcon('last_name')}
                    </th>
                    <th onClick={() => handleSort('account_type')} className="sortable">
                      Role {getSortIcon('account_type')}
                    </th>
                    <th onClick={() => handleSort('email')} className="sortable">
                      Email {getSortIcon('email')}
                    </th>
                    <th onClick={() => handleSort('salary')} className="sortable">
                      Salary {getSortIcon('salary')}
                    </th>
                    <th onClick={() => handleSort('facility_name')} className="sortable">
                      Facility {getSortIcon('facility_name')}
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
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="empty-state">
                        {searchQuery || roleFilter !== 'all' ? 'No employees match your search criteria.' : 'No employees found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map(employee => (
                      <tr key={employee.employee_id}>
                        <td>{employee.employee_id}</td>
                        <td>{employee.first_name}</td>
                        <td>{employee.last_name}</td>
                        <td className="capitalize">{employee.account_type}</td>
                        <td>{employee.email}</td>
                        <td>${parseFloat(employee.salary || 0).toLocaleString()}</td>
                        <td>{employee.facility_name}</td>
                        <td>
                          {employee.street_name}, {employee.city_name}, {employee.state_name} {employee.zip_code}
                        </td>
                        <td>
                          <div className="employee-table-actions">
                            <button
                              onClick={() => handleEditClick(employee)}
                              className="employee-edit-btn"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(employee)}
                              className="employee-delete-btn"
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
            <p className="employee-table-stats">
              Showing {filteredEmployees.length} of {employees.length} employees. Click column headers to sort.
            </p>
          </>
        )}
      </div>

      {/* Add Employee Modal */}
      <Modal show={showAddModal} title="Add New Employee" onClose={() => setShowAddModal(false)}>
        <form onSubmit={handleSubmit}>
              <div className="employee-form-grid">
                {/* First Name */}
                <div className="employee-form-field">
                  <label>First Name: <span className="required-asterisk">*</span></label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>

                {/* Last Name */}
                <div className="employee-form-field">
                  <label>Last Name: <span className="required-asterisk">*</span></label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>

                {/* Account Type */}
                <div className="employee-form-field">
                  <label>Role: <span className="required-asterisk">*</span></label>
                  <select value={accountType} onChange={(e) => setAccountType(e.target.value)} required>
                    <option value="clerk">Clerk</option>
                    <option value="courier">Courier</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                {/* Email */}
                <div className="employee-form-field">
                  <label>Email: <span className="required-asterisk">*</span></label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                {/* Password */}
                <div className="employee-form-field">
                  <label>Password: <span className="required-asterisk">*</span></label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                {/* Salary */}
                <div className="employee-form-field">
                  <label>Salary: <span className="required-asterisk">*</span></label>
                  <input type="number" step="0.01" value={salary} onChange={(e) => setSalary(e.target.value)} required />
                </div>

                {/* Facility */}
                <div className="employee-form-field">
                  <label>Facility: <span className="required-asterisk">*</span></label>
                  <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)} required>
                    {facilities.map(facility => (
                      <option key={facility.facility_id} value={facility.facility_id}>
                        {facility.facility_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Street */}
                <div className="employee-form-field employee-form-field-full">
                  <label>Street Address: <span className="required-asterisk">*</span></label>
                  <input type="text" value={streetName} onChange={(e) => setStreetName(e.target.value)} required />
                </div>

                {/* City */}
                <div className="employee-form-field">
                  <label>City: <span className="required-asterisk">*</span></label>
                  <input type="text" value={cityName} onChange={(e) => setCityName(e.target.value)} required />
                </div>

                {/* State */}
                <div className="employee-form-field">
                  <label>State (2 letters): <span className="required-asterisk">*</span></label>
                  <input type="text" value={stateName} onChange={(e) => setStateName(e.target.value.toUpperCase())} placeholder="TX" maxLength="2" required />
                </div>

                {/* Zip */}
                <div className="employee-form-field">
                  <label>Zip Code (5 digits): <span className="required-asterisk">*</span></label>
                  <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="12345" maxLength="5" required />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" disabled={loading} className="modal-submit-button">
                  {loading ? 'Adding...' : 'Add Employee'}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="modal-cancel-button">
                  Cancel
                </button>
              </div>
            </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        show={showEditModal && editingEmployee !== null}
        title={editingEmployee ? `Edit Employee (ID: ${editingEmployee.employee_id})` : 'Edit Employee'}
        onClose={() => setShowEditModal(false)}
      >
        <form onSubmit={handleEditSubmit}>
              <div className="employee-form-grid">
                {/* First Name */}
                <div className="employee-form-field">
                  <label>First Name: <span className="required-asterisk">*</span></label>
                  <input type="text" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} required />
                </div>

                {/* Last Name */}
                <div className="employee-form-field">
                  <label>Last Name: <span className="required-asterisk">*</span></label>
                  <input type="text" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} required />
                </div>

                {/* Account Type */}
                <div className="employee-form-field">
                  <label>Role: <span className="required-asterisk">*</span></label>
                  <select value={editAccountType} onChange={(e) => setEditAccountType(e.target.value)} required>
                    <option value="clerk">Clerk</option>
                    <option value="courier">Courier</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                {/* Email */}
                <div className="employee-form-field">
                  <label>Email: <span className="required-asterisk">*</span></label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
                </div>

                {/* Salary */}
                <div className="employee-form-field">
                  <label>Salary: <span className="required-asterisk">*</span></label>
                  <input type="number" step="0.01" value={editSalary} onChange={(e) => setEditSalary(e.target.value)} required />
                </div>

                {/* Facility */}
                <div className="employee-form-field">
                  <label>Facility: <span className="required-asterisk">*</span></label>
                  <select value={editFacilityId} onChange={(e) => setEditFacilityId(e.target.value)} required>
                    {facilities.map(facility => (
                      <option key={facility.facility_id} value={facility.facility_id}>
                        {facility.facility_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Street */}
                <div className="employee-form-field employee-form-field-full">
                  <label>Street Address: <span className="required-asterisk">*</span></label>
                  <input type="text" value={editStreetName} onChange={(e) => setEditStreetName(e.target.value)} required />
                </div>

                {/* City */}
                <div className="employee-form-field">
                  <label>City: <span className="required-asterisk">*</span></label>
                  <input type="text" value={editCityName} onChange={(e) => setEditCityName(e.target.value)} required />
                </div>

                {/* State */}
                <div className="employee-form-field">
                  <label>State (2 letters): <span className="required-asterisk">*</span></label>
                  <input type="text" value={editStateName} onChange={(e) => setEditStateName(e.target.value.toUpperCase())} placeholder="TX" maxLength="2" required />
                </div>

                {/* Zip */}
                <div className="employee-form-field">
                  <label>Zip Code (5 digits): <span className="required-asterisk">*</span></label>
                  <input type="text" value={editZipCode} onChange={(e) => setEditZipCode(e.target.value)} placeholder="12345" maxLength="5" required />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" disabled={loading} className="modal-submit-button">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="modal-cancel-button">
                  Cancel
                </button>
              </div>
            </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={showDeleteModal && deletingEmployee !== null}
        entityType="Employee"
        entityName={deletingEmployee ? `${deletingEmployee.first_name} ${deletingEmployee.last_name}` : ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Success Toast Notification */}
      <Toast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default EmployeesPage;
