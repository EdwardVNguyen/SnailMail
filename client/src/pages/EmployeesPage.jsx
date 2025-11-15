import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserShipping.css';
import './EmployeesPage.css';
import './CreatePackage.css';

import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import "ag-grid-community/styles/ag-theme-alpine.css";

import { formatSSN, formatPhoneNumber } from '../utils/formatting';
import { isValidEmail, isValidSSN, isValidZipCode, isValidState, isValidPhone } from '../utils/validation';
import FilterPanel from '../components/FilterPanel';

ModuleRegistry.registerModules([AllCommunityModule]);

const EmployeesPage = ({ globalAuthId }) => {
  const authId = globalAuthId;
  const navigate = useNavigate();

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for Add Employee
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [accountType, setAccountType] = useState('clerk');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [streetName, setStreetName] = useState('');
  const [cityName, setCityName] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [salary, setSalary] = useState('');
  const [employeeSsn, setEmployeeSsn] = useState('');
  const [facilityId, setFacilityId] = useState('');

  // Employees grid state
  const [roleFilter, setRoleFilter] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [safetyLock, setSafetyLock] = useState(true);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState([]);

  // Format SSN with dashes as user types
  const handleSsnChange = (e) => {
    const formatted = formatSSN(e.target.value);
    setEmployeeSsn(formatted);
  };

  // Fetch facilities on mount
  useEffect(() => {
    fetchFacilities();
  }, []);

  // Fetch employees on mount and when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [roleFilter]);

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
      let url = `${import.meta.env.VITE_API_URL}/getEmployees?`;
      const params = [];
      if (roleFilter !== 'all') {
        params.push(`role=${roleFilter}`);
      }
      url += params.join('&');

      const response = await fetch(url);
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

  const getRowId = useCallback((params) => {
    return params.data.employee_id.toString();
  }, []);

  const onCellValueChanged = async (params) => {
    const updatedEmployee = params.data;
    const field = params.colDef.field;
    const newValue = params.newValue;
    const oldValue = params.oldValue;

    if (field === 'employee_id' || field === 'employee_ssn') {
      const confirmed = window.confirm(
        `Are you sure you want to change ${field === 'employee_id' ? 'Employee ID' : 'SSN'} from ${oldValue} to ${newValue}?\n\nThis will check for uniqueness before applying.`
      );

      if (!confirmed) {
        fetchEmployees();
        return;
      }

      try {
        const checkResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/checkEmployeeUniqueness?field=${field}&value=${newValue}&currentId=${updatedEmployee.employee_id}`
        );
        const checkData = await checkResponse.json();

        if (!checkData.isUnique) {
          alert(`This ${field === 'employee_id' ? 'Employee ID' : 'SSN'} is already in use. Change reverted.`);
          fetchEmployees();
          return;
        }
      } catch (err) {
        console.error('Error checking uniqueness:', err);
        alert('Error checking uniqueness. Change reverted.');
        fetchEmployees();
        return;
      }
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/updateEmployee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: updatedEmployee.employee_id,
          field: field,
          value: newValue,
          updatedBy: authId
        })
      });

      const data = await response.json();
      if (!data.success) {
        alert('Error updating employee: ' + data.message);
        fetchEmployees();
      }
    } catch (err) {
      console.error('Error updating employee:', err);
      alert('Error updating employee.');
      fetchEmployees();
    }
  };

  const validateForm = () => {
    // Required fields
    if (!firstName || !lastName || !accountType || !email || !password ||
        !streetName || !cityName || !stateName || !zipCode || !employeeSsn || !salary || !facilityId) {
      alert('Please fill in all required fields.');
      return false;
    }

    // Email validation
    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return false;
    }

    // SSN validation
    if (!isValidSSN(employeeSsn)) {
      alert('Please enter a valid SSN (XXX-XX-XXXX).');
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
          middleName: middleName || null,
          lastName,
          accountType,
          email,
          password,
          streetName,
          cityName,
          stateName,
          zipCode,
          salary: parseFloat(salary),
          employeeSsn,
          facilityId: parseInt(facilityId),
          createdBy: authId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setFirstName('');
        setMiddleName('');
        setLastName('');
        setAccountType('clerk');
        setEmail('');
        setPassword('');
        setStreetName('');
        setCityName('');
        setStateName('');
        setZipCode('');
        setSalary('');
        setEmployeeSsn('');
        // Reset facility to first one
        if (facilities.length > 0) {
          setFacilityId(facilities[0].facility_id);
        }

        alert('Employee added successfully!');
        setShowAddModal(false);
        fetchEmployees(); // Refresh the grid
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

  const handleDeleteEmployee = async (employeeId) => {
    if (deletingEmployeeId === employeeId) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to DELETE employee ID ${employeeId}?\n\nThis action cannot be undone!`
    );

    if (!confirmed) {
      return;
    }

    setDeletingEmployeeId(employeeId);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/deleteEmployee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employeeId,
          deletedBy: authId
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Employee deleted successfully!');
        fetchEmployees();
      } else {
        alert('Error deleting employee: ' + data.message);
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Error deleting employee.');
    } finally {
      setDeletingEmployeeId(null);
    }
  };

  const columnDefs = [
    { field: 'employee_id', headerName: 'ID', sortable: true, filter: true, editable: !safetyLock, width: 100 },
    { field: 'first_name', headerName: 'First Name', sortable: true, filter: true, editable: true, width: 130 },
    { field: 'middle_name', headerName: 'Middle', sortable: true, filter: true, editable: true, width: 100 },
    { field: 'last_name', headerName: 'Last Name', sortable: true, filter: true, editable: true, width: 130 },
    { field: 'account_type', headerName: 'Role', sortable: true, filter: true, editable: true, width: 110,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['manager', 'clerk', 'courier']
      }
    },
    { field: 'email', headerName: 'Email', sortable: true, filter: true, editable: true, flex: 1 },
    { field: 'employee_ssn', headerName: 'SSN', sortable: true, filter: true, editable: !safetyLock, width: 130 },
    { field: 'salary', headerName: 'Salary', sortable: true, filter: true, editable: true, width: 110 },
    { field: 'facility_id', headerName: 'Facility ID', sortable: true, filter: true, editable: true, width: 100 },
    { field: 'facility_name', headerName: 'Facility', sortable: true, filter: true, editable: false, width: 150 },
    { field: 'street_name', headerName: 'Street', sortable: true, filter: true, editable: true, flex: 1 },
    { field: 'city_name', headerName: 'City', sortable: true, filter: true, editable: true, width: 120 },
    { field: 'state_name', headerName: 'State', sortable: true, filter: true, editable: true, width: 80 },
    { field: 'zip_code', headerName: 'Zip', sortable: true, filter: true, editable: true, width: 100 }
  ];

  return (
    <div className="create-package-container">
      <div className="package-header">
        <h1>Employees</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowAddModal(true)} className="add-button" style={{
            padding: '10px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#3C467B',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            + Add Employee
          </button>
          <button onClick={() => navigate('/managerPage')} className="back-button">
            ← Back to Manager
          </button>
        </div>
      </div>

      {/* Separator Line */}
      <div style={{ borderTop: '1px solid #e9ecef', marginBottom: '20px' }}></div>

      {/* Filter Panel */}
      <FilterPanel
        filters={[
          {
            label: 'Filter by Role',
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { value: 'all', label: 'All Employees' },
              { value: 'manager', label: 'Managers' },
              { value: 'clerk', label: 'Clerks' },
              { value: 'courier', label: 'Couriers' }
            ]
          }
        ]}
        toggles={[
          {
            label: 'Safety Lock (ID & SSN)',
            value: safetyLock,
            onToggle: () => setSafetyLock(!safetyLock),
            activeText: 'Locked',
            inactiveText: 'Unlocked',
            activeColor: '#50589C',
            helpText: {
              active: 'ID & SSN cannot be edited',
              inactive: 'ID & SSN can be edited'
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

      {/* Employees Grid */}
      {loadingEmployees ? (
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px' }}>
          Loading employees...
        </div>
      ) : deleteMode ? (
        <div>
          <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '5px', color: '#856404' }}>
            <strong>Delete Mode:</strong> Double-click any row to delete that employee
          </div>
          <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 350px)', minHeight: '400px', width: "100%" }}>
            <AgGridReact
              rowData={employees}
              columnDefs={columnDefs}
              defaultColDef={{
                sortable: true,
                filter: true,
                editable: false
              }}
              getRowId={getRowId}
              onRowDoubleClicked={(params) => handleDeleteEmployee(params.data.employee_id)}
              rowClass="archive-mode-row"
              getRowStyle={(params) => {
                if (deletingEmployeeId === params.data.employee_id) {
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
        <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 350px)', minHeight: '400px', width: "100%" }}>
          <AgGridReact
            rowData={employees}
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

      {/* Add Employee Modal */}
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
            <h2>Add New Employee</h2>
            <form onSubmit={handleSubmit} className="employee-form-card">
              <div className="employee-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {/* First Name */}
                <div className="employee-form-field">
                  <label>First Name: <span className="required-asterisk">*</span></label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>

                {/* Middle Name */}
                <div className="employee-form-field">
                  <label>Middle Name:</label>
                  <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
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

                {/* SSN */}
                <div className="employee-form-field">
                  <label>SSN (XXX-XX-XXXX): <span className="required-asterisk">*</span></label>
                  <input type="text" value={employeeSsn} onChange={handleSsnChange} placeholder="123-45-6789" maxLength="11" required />
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
                <div className="employee-form-field" style={{ gridColumn: '1 / -1' }}>
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

              <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="submit" disabled={loading} style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: '#3C467B',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}>
                  {loading ? 'Adding...' : 'Add Employee'}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
