import { useState, useEffect, useCallback } from 'react';
import './UserShipping.css';
import './EmployeesPage.css';

import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import "ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const EmployeesPage = ({ globalAuthId }) => {
  const authId = globalAuthId;

  // Tab state
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'edit'

  // Form state for Add Employee
  const [employeeId, setEmployeeId] = useState('');
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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [salary, setSalary] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [employeeSsn, setEmployeeSsn] = useState('');

  // Edit Employees state
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'manager', 'clerk', 'courier'
  const [statusFilter, setStatusFilter] = useState('active'); // 'all', 'active', 'archived'
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [safetyLock, setSafetyLock] = useState(true); // Safety lock for ID and SSN editing
  const [deleteMode, setDeleteMode] = useState(false); // Toggle delete mode
  const [deletingEmployeeId, setDeletingEmployeeId] = useState(null); // Track which employee is being deleted

  // Format SSN with dashes as user types
  const handleSsnChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 9) value = value.slice(0, 9); // Limit to 9 digits

    // Add dashes at appropriate positions
    if (value.length > 5) {
      value = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5);
    }
    else if (value.length > 3) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    }

    setEmployeeSsn(value);
  };

  // Format phone number with dashes as user types
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits

    // Add dashes at appropriate positions
    if (value.length > 6) {
      value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6);
    }
    else if (value.length > 3) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    }

    setPhoneNumber(value);
  };

  const [nextEmployeeId, setNextEmployeeId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch the next available employee_id
  useEffect(() => {
    const fetchNextEmployeeId = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/getNextEmployeeId`);
        const data = await response.json();
        if (data.success) {
          setNextEmployeeId(data.nextEmployeeId);
          setEmployeeId(data.nextEmployeeId.toString());
        }
      }
      catch (err) {
        console.error('Error fetching next employee ID:', err);
      }
    };

    fetchNextEmployeeId();
  }, []);

  // Fetch employees when on edit tab (with debouncing)
  useEffect(() => {
    if (activeTab === 'edit') {
      // Debounce the fetch to prevent rapid requests
      const timeoutId = setTimeout(() => {
        fetchEmployees();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, roleFilter, statusFilter]);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      let url = `${import.meta.env.VITE_API_URL}/getEmployees?`;
      const params = [];

      if (roleFilter !== 'all') {
        params.push(`role=${roleFilter}`);
      }
      if (statusFilter !== 'all') {
        params.push(`status=${statusFilter}`);
      }

      url += params.join('&');

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setEmployees(data.employees);
      }
      else {
        console.error('Failed to fetch employees:', data.message);
      }
    }
    catch (err) {
      console.error('Error fetching employees:', err);
    }
    finally {
      setLoadingEmployees(false);
    }
  };

  // AG Grid callback for unique row IDs
  const getRowId = useCallback((params) => {
    return params.data.employee_id.toString();
  }, []);

  // Handle cell value change
  const onCellValueChanged = async (params) => {
    const updatedEmployee = params.data;
    const field = params.colDef.field;
    const newValue = params.newValue;
    const oldValue = params.oldValue;

    // Check if editing ID or SSN (requires uniqueness check)
    if (field === 'employee_id' || field === 'employee_ssn') {
      // Confirm the change
      const confirmed = window.confirm(
        `Are you sure you want to change ${field === 'employee_id' ? 'Employee ID' : 'SSN'} from ${oldValue} to ${newValue}?\n\nThis will check for uniqueness before applying.`
      );

      if (!confirmed) {
        // Revert the change
        fetchEmployees();
        return;
      }

      // Check uniqueness
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
      }
      catch (err) {
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
        // Refresh to revert changes
        fetchEmployees();
      }
    }
    catch (err) {
      console.error('Error updating employee:', err);
      alert('Error updating employee.');
      fetchEmployees();
    }
  };

  const validateForm = () => {
    // Required fields
    if (!employeeId || !firstName || !lastName || !accountType || !email || !password ||
        !streetName || !cityName || !stateName || !zipCode || !employeeSsn) {
      alert('Please fill in all required fields.');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return false;
    }

    // SSN validation (format: XXX-XX-XXXX)
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    if (!ssnRegex.test(employeeSsn)) {
      alert('Please enter SSN in format: XXX-XX-XXXX');
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
    if (!stateRegex.test(stateName)) {
      alert('Please enter a valid 2-letter state code (e.g., TX, CA).');
      return false;
    }

    // Phone number validation (optional but if provided must be valid)
    if (phoneNumber) {
      const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
      if (!phoneRegex.test(phoneNumber)) {
        alert('Please enter phone number in format: XXX-XXX-XXXX');
        return false;
      }
    }

    // Salary validation (optional but if provided must be positive)
    if (salary && (isNaN(salary) || parseFloat(salary) < 0)) {
      alert('Please enter a valid salary amount.');
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
          employeeId: parseInt(employeeId),
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
          phoneNumber: phoneNumber ? phoneNumber.replace(/\D/g, '') : null,
          birthDate: birthDate || null,
          salary: salary ? parseFloat(salary) : null,
          ethnicity: ethnicity || null,
          employeeSsn,
          createdBy: authId
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Employee added successfully!');
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
        setPhoneNumber('');
        setBirthDate('');
        setSalary('');
        setEthnicity('');
        setEmployeeSsn('');
        // Fetch new next employee ID
        const nextIdResponse = await fetch(`${import.meta.env.VITE_API_URL}/getNextEmployeeId`);
        const nextIdData = await nextIdResponse.json();
        if (nextIdData.success) {
          setNextEmployeeId(nextIdData.nextEmployeeId);
          setEmployeeId(nextIdData.nextEmployeeId.toString());
        }
      }
      else {
        alert('Error adding employee: ' + data.message);
      }
    }
    catch (err) {
      console.error('Error adding employee:', err);
      alert('Error adding employee.');
    }
    finally {
      setLoading(false);
    }
  };

  // Handle archive employee
  const handleDeleteEmployee = async (employeeId) => {
    // Prevent multiple clicks
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
      }
      else {
        alert('Error deleting employee: ' + data.message);
      }
    }
    catch (err) {
      console.error('Error deleting employee:', err);
      alert('Error deleting employee.');
    }
    finally {
      setDeletingEmployeeId(null);
    }
  };

  // Column definitions for AG Grid
  const columnDefs = [
    { field: 'employee_id', headerName: 'ID', sortable: true, filter: true, editable: !safetyLock, width: 100 },
    { field: 'first_name', headerName: 'First Name', sortable: true, filter: true, editable: true, flex: 1 },
    { field: 'middle_name', headerName: 'Middle Name', sortable: true, filter: true, editable: true, flex: 1 },
    { field: 'last_name', headerName: 'Last Name', sortable: true, filter: true, editable: true, flex: 1 },
    { field: 'account_type', headerName: 'Role', sortable: true, filter: true, editable: true, width: 120,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['manager', 'clerk', 'courier']
      }
    },
    { field: 'email', headerName: 'Email', sortable: true, filter: true, editable: true, flex: 1.5 },
    { field: 'phone_number', headerName: 'Phone', sortable: true, filter: true, editable: true, width: 150 },
    { field: 'salary', headerName: 'Salary', sortable: true, filter: true, editable: true, width: 120 },
    { field: 'employee_ssn', headerName: 'SSN', sortable: true, filter: true, editable: !safetyLock, width: 130 }
  ];

  return (
    <div style={{ marginTop: '30px', width: '100%', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="userShippingTop">
          <div className="userShippingDesc">
            Employees <span>Manage employee information</span>
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
            Add Employee
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
            Edit Employees
          </button>
        </div>

        {/* Add Employee Section */}
        {activeTab === 'add' && (
        <div style={{ padding: '20px', border: '1px solid rgba(0,0,0,0.2)', marginBottom: '20px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#50589C' }}>Add Employee</h2>

          <form onSubmit={handleSubmit}>
            <div className="employee-form-grid">
              {/* Employee ID */}
              <div className="employee-form-field">
                <label>
                  Employee ID: <span className="required-asterisk">*</span>
                </label>
                <input
                  type="number"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder={nextEmployeeId ? `Auto: ${nextEmployeeId}` : 'Loading...'}
                  required
                />
                <small>Auto-calculated, but you can enter your own</small>
              </div>

              {/* Account Type */}
              <div className="employee-form-field">
                <label>
                  Account Type: <span className="required-asterisk">*</span>
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  required
                >
                  <option value="clerk">Clerk</option>
                  <option value="courier">Courier</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              {/* First Name */}
              <div className="employee-form-field">
                <label>
                  First Name: <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              {/* Middle Name */}
              <div className="employee-form-field">
                <label>Middle Name:</label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>

              {/* Last Name */}
              <div className="employee-form-field">
                <label>
                  Last Name: <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="employee-form-field">
                <label>
                  Email: <span className="required-asterisk">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <small>Must be unique</small>
              </div>

              {/* Password */}
              <div className="employee-form-field">
                <label>
                  Password: <span className="required-asterisk">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* SSN */}
              <div className="employee-form-field">
                <label>
                  SSN (XXX-XX-XXXX): <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  value={employeeSsn}
                  onChange={handleSsnChange}
                  placeholder="123-45-6789"
                  required
                />
                <small>Must be unique</small>
              </div>

              {/* Phone Number */}
              <div className="employee-form-field">
                <label>Phone Number (XXX-XXX-XXXX):</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="123-456-7890"
                />
              </div>

              {/* Birth Date */}
              <div className="employee-form-field">
                <label>Birth Date:</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              {/* Salary */}
              <div className="employee-form-field">
                <label>Salary:</label>
                <input
                  type="number"
                  step="0.01"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="50000.00"
                />
              </div>

              {/* Ethnicity */}
              <div className="employee-form-field">
                <label>Ethnicity:</label>
                <input
                  type="text"
                  value={ethnicity}
                  onChange={(e) => setEthnicity(e.target.value)}
                />
              </div>

              {/* Street Name */}
              <div className="employee-form-field">
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
              <div className="employee-form-field">
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
              <div className="employee-form-field">
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
              <div className="employee-form-field">
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
              {loading ? 'Adding Employee...' : 'Add Employee'}
            </button>
          </form>
        </div>
        )}

        {/* Edit Employees Section */}
        {activeTab === 'edit' && (
        <div style={{ padding: '20px', border: '1px solid rgba(0,0,0,0.2)', marginBottom: '20px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#50589C' }}>Edit Employees</h2>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', alignItems: 'flex-start' }}>
            {/* Role Filter Dropdown */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Filter by Role:
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ padding: '8px', fontSize: '14px', minWidth: '200px' }}
              >
                <option value="all">All Employees</option>
                <option value="manager">Managers</option>
                <option value="clerk">Clerks</option>
                <option value="courier">Couriers</option>
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
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Safety Lock Toggle */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Safety Lock (ID & SSN):
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
                {safetyLock ? 'ID & SSN cannot be edited' : 'ID & SSN can be edited'}
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

          {loadingEmployees ? (
            <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px' }}>
              Loading employees...
            </div>
          ) : deleteMode ? (
            /* Archive Table */
            <div>
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '5px', color: '#856404' }}>
                <strong>Delete Mode:</strong> Double-click any row to delete that employee
              </div>
              <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
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
            <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
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
        </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesPage;
