import './CustomerPage.css';

const ManagerPage = ( {globalAuthId} ) => {
  return (
    <div className="customerPageContainer">
      <h1>Manager Dashboard</h1>
      <p>Welcome to your SnailMail manager account! Use the navigation menu above to manage operations, staff, and facilities.</p>

      <h2>What You Can Do</h2>

      <h3>Employees</h3>
      <p>Click on "Employees" in the top menu to manage your workforce. View all employees, add new staff members, update employee information, and assign roles and responsibilities.</p>

      <h3>Facilities</h3>
      <p>Click on "Facilities" in the top menu to manage your distribution centers and post offices. View facility locations, track package inventory at each location, and monitor facility operations.</p>

      <h3>Reports</h3>
      <p>Click on "Reports" in the top menu to access operational reports and analytics. View problem packages, facility backlogs, average delivery times, and courier performance metrics to optimize operations.</p>
    </div>
  );
};

export default ManagerPage;
