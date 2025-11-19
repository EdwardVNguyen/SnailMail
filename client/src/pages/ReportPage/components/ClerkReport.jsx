const ClerkReport = ({
  reportData,
  clerkStartDate,
  clerkEndDate,
  setClerkStartDate,
  setClerkEndDate,
  setClerkDateRange,
  handleClerkRowClick
}) => {
  if (!reportData || !reportData.clerks) return <div>No data available</div>;

  return (
    <div className="reportContent">
      <div className="reportHeader">
        <h2>Clerk Report</h2>
        <p>Clerk performance, reviews, and tracking activity (Click a row for details)</p>

        <div className="dateRangeSelector">
          <div className="dateInput">
            <label>From:</label>
            <input
              type="date"
              value={clerkStartDate}
              onChange={(e) => setClerkStartDate(e.target.value)}
            />
          </div>
          <div className="dateInput">
            <label>To:</label>
            <input
              type="date"
              value={clerkEndDate}
              onChange={(e) => setClerkEndDate(e.target.value)}
            />
          </div>
          <div className="datePresetButtons">
            <button onClick={() => setClerkDateRange('week')} className="presetButton">1 Week</button>
            <button onClick={() => setClerkDateRange('month')} className="presetButton">1 Month</button>
            <button onClick={() => setClerkDateRange('year')} className="presetButton">1 Year</button>
            <button onClick={() => setClerkDateRange('all')} className="presetButton">All Time</button>
          </div>
        </div>

        <div className="reportStats">
          <div className="statCard">
            <div className="statValue">{reportData.summary.total_reviews}</div>
            <div className="statLabel">Total Reviews</div>
          </div>
          <div className="statCard">
            <div className="statValue">{reportData.summary.total_approved}</div>
            <div className="statLabel">Approved</div>
          </div>
          <div className="statCard">
            <div className="statValue">{reportData.summary.total_rejected}</div>
            <div className="statLabel">Rejected</div>
          </div>
          <div className="statCard">
            <div className="statValue">{reportData.summary.overall_approval_rate}%</div>
            <div className="statLabel">Approval Rate</div>
          </div>
          <div className="statCard">
            <div className="statValue">{reportData.summary.total_events}</div>
            <div className="statLabel">Tracking Events</div>
          </div>
          <div className="statCard">
            <div className="statValue">{reportData.summary.total_problem_packages}</div>
            <div className="statLabel">Problem Packages</div>
          </div>
          <div className="statCard">
            <div className="statValue">{reportData.summary.total_packages_processed}</div>
            <div className="statLabel">Packages Processed</div>
          </div>
        </div>
      </div>

      <div className="tableContainer">
        <table className="reportTable">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Clerk Name</th>
              <th>Facility</th>
              <th>Reviews</th>
              <th>Approved</th>
              <th>Rejected</th>
              <th>Approval Rate</th>
              <th>Events Created</th>
              <th>Problem Pkgs</th>
              <th>Packages Processed</th>
            </tr>
          </thead>
          <tbody>
            {reportData.clerks.map((clerk) => (
              <tr
                key={clerk.employee_id}
                onClick={() => handleClerkRowClick(clerk)}
                className="clickable-row"
              >
                <td>{clerk.employee_id}</td>
                <td>{clerk.clerk_name}</td>
                <td>{clerk.facility_name}</td>
                <td>{clerk.total_reviews}</td>
                <td>{clerk.reviews_approved}</td>
                <td>{clerk.reviews_rejected}</td>
                <td><span className={clerk.approval_rate >= 75 ? 'rate good' : 'rate needs-improvement'}>{clerk.approval_rate}%</span></td>
                <td>{clerk.events_total}</td>
                <td>{clerk.problem_packages}</td>
                <td>{clerk.unique_packages_processed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClerkReport;
