const CourierReport = ({
  reportData,
  courierStartDate,
  courierEndDate,
  setCourierStartDate,
  setCourierEndDate,
  setCourierDateRange,
  handleCourierRowClick
}) => {
  if (!reportData || !reportData.couriers) return <div>No data available</div>;

  return (
    <div className="reportContent">
      <div className="reportHeader">
        <h2>Courier Report</h2>
        <p>Courier performance, deliveries, and package handling metrics (Click a row for details)</p>

        <div className="dateRangeSelector">
          <div className="dateInput">
            <label>From:</label>
            <input
              type="date"
              value={courierStartDate}
              onChange={(e) => setCourierStartDate(e.target.value)}
            />
          </div>
          <div className="dateInput">
            <label>To:</label>
            <input
              type="date"
              value={courierEndDate}
              onChange={(e) => setCourierEndDate(e.target.value)}
            />
          </div>
          <div className="datePresetButtons">
            <button onClick={() => setCourierDateRange('week')} className="presetButton">1 Week</button>
            <button onClick={() => setCourierDateRange('month')} className="presetButton">1 Month</button>
            <button onClick={() => setCourierDateRange('year')} className="presetButton">1 Year</button>
            <button onClick={() => setCourierDateRange('all')} className="presetButton">All Time</button>
          </div>
        </div>

        <div className="reportStats">
          <div className="statCard">
            <div className="statValue">{reportData.summary.total_claimed}</div>
            <div className="statLabel">Total Claimed</div>
          </div>
          <div className="statCard">
            <div className="statValue">{reportData.summary.total_delivered}</div>
            <div className="statLabel">Total Delivered</div>
          </div>
          <div className="statCard">
            <div className="statValue">{reportData.summary.total_lost}</div>
            <div className="statLabel">Lost Packages</div>
          </div>
          <div className="statCard">
            <div className="statValue">{reportData.summary.total_facility_transfers}</div>
            <div className="statLabel">Facility Transfers</div>
          </div>
          <div className="statCard">
            <div className="statValue">{reportData.summary.total_final_deliveries}</div>
            <div className="statLabel">Final Deliveries</div>
          </div>
        </div>
      </div>

      <div className="tableContainer">
        <table className="reportTable">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Courier Name</th>
              <th>Claimed</th>
              <th>Delivered</th>
              <th>Lost</th>
              <th>Facility Transfers</th>
              <th>Final Deliveries</th>
              <th>Request Approval Rate</th>
            </tr>
          </thead>
          <tbody>
            {reportData.couriers.map((courier) => (
              <tr
                key={courier.employee_id}
                onClick={() => handleCourierRowClick(courier)}
                className="clickable-row"
              >
                <td>{courier.employee_id}</td>
                <td>{courier.courier_name}</td>
                <td>{courier.packages_claimed}</td>
                <td>{courier.packages_delivered}</td>
                <td>{courier.packages_lost}</td>
                <td>{courier.facility_transfers}</td>
                <td>{courier.final_deliveries}</td>
                <td><span className={courier.request_approval_rate >= 75 ? 'rate good' : 'rate needs-improvement'}>{courier.request_approval_rate}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourierReport;
