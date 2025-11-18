import { useState, useEffect } from 'react';
import './ReportPage.css';

const ReportPage = ({ globalAuthId }) => {
  const [activeReport, setActiveReport] = useState('facility');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Date range states
  const [facilityStartDate, setFacilityStartDate] = useState('');
  const [facilityEndDate, setFacilityEndDate] = useState('');
  const [clerkStartDate, setClerkStartDate] = useState('');
  const [clerkEndDate, setClerkEndDate] = useState('');
  const [courierStartDate, setCourierStartDate] = useState('');
  const [courierEndDate, setCourierEndDate] = useState('');

  // Initialize dates on component mount
  useEffect(() => {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];

    // All reports: 30 days back for end date
    const thirtyDaysBack = new Date(today);
    thirtyDaysBack.setDate(thirtyDaysBack.getDate() - 30);
    const endDate = thirtyDaysBack.toISOString().split('T')[0];

    setFacilityStartDate(startDate);
    setFacilityEndDate(endDate);
    setClerkStartDate(startDate);
    setClerkEndDate(endDate);
    setCourierStartDate(startDate);
    setCourierEndDate(endDate);
  }, []);

  // Fetch report data when active report changes or dates change
  useEffect(() => {
    let cancelled = false;

    const fetchReportData = async (reportType) => {
      // Don't fetch if dates aren't initialized yet
      if (reportType === 'facility' && (!facilityStartDate || !facilityEndDate)) return;
      if (reportType === 'clerk' && (!clerkStartDate || !clerkEndDate)) return;
      if (reportType === 'courier' && (!courierStartDate || !courierEndDate)) return;

      setLoading(true);
      setReportData(null); // Clear previous data

      try {
        let endpoint = '';
        let url = '';

        switch (reportType) {
          case 'facility':
            endpoint = 'getFacilityReport';
            url = `${import.meta.env.VITE_API_URL}/${endpoint}?startDate=${facilityStartDate}&endDate=${facilityEndDate}`;
            break;
          case 'clerk':
            endpoint = 'getClerkReport';
            url = `${import.meta.env.VITE_API_URL}/${endpoint}?startDate=${clerkStartDate}&endDate=${clerkEndDate}`;
            break;
          case 'courier':
            endpoint = 'getCourierReport';
            url = `${import.meta.env.VITE_API_URL}/${endpoint}?startDate=${courierStartDate}&endDate=${courierEndDate}`;
            break;
          default:
            endpoint = 'getFacilityReport';
            url = `${import.meta.env.VITE_API_URL}/${endpoint}?startDate=${facilityStartDate}&endDate=${facilityEndDate}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        // Only update state if this request wasn't cancelled
        if (!cancelled && data.success) {
          setReportData(data);
        }
        else if (!cancelled) {
          console.error('Failed to fetch report:', data.message);
        }
      }
      catch (error) {
        if (!cancelled) {
          console.error('Error fetching report:', error);
        }
      }
      finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchReportData(activeReport);

    // Cleanup function to prevent state updates if component unmounts or report changes
    return () => {
      cancelled = true;
    };
  }, [activeReport, facilityStartDate, facilityEndDate, clerkStartDate, clerkEndDate, courierStartDate, courierEndDate]);

  const renderFacilityReport = () => {
    if (!reportData || !reportData.facilities) return <div>No data available</div>;

    return (
      <div className="reportContent">
        <div className="reportHeader">
          <h2>Facility Report</h2>
          <p>Comprehensive facility performance and metrics</p>

          <div className="dateRangeSelector">
            <div className="dateInput">
              <label>End Date (higher):</label>
              <input
                type="date"
                value={facilityStartDate}
                onChange={(e) => setFacilityStartDate(e.target.value)}
              />
            </div>
            <div className="dateInput">
              <label>Start Date (lower):</label>
              <input
                type="date"
                value={facilityEndDate}
                onChange={(e) => setFacilityEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="reportStats">
            <div className="statCard">
              <div className="statValue">{reportData.summary.total_received}</div>
              <div className="statLabel">Total Received</div>
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
              <div className="statValue">{reportData.summary.total_backlog}</div>
              <div className="statLabel">Current Backlog</div>
            </div>
            <div className="statCard">
              <div className="statValue">{reportData.summary.avg_delivery_days}</div>
              <div className="statLabel">Avg Delivery Days</div>
            </div>
            <div className="statCard">
              <div className="statValue">{reportData.summary.overall_lost_rate}%</div>
              <div className="statLabel">Lost Rate</div>
            </div>
          </div>
        </div>

        <div className="tableContainer">
          <table className="reportTable">
            <thead>
              <tr>
                <th>Facility ID</th>
                <th>Facility Name</th>
                <th>Address</th>
                <th>Received</th>
                <th>Delivered</th>
                <th>Lost</th>
                <th>Lost Rate</th>
                <th>Avg Days</th>
                <th>Backlog</th>
                <th>Processing</th>
                <th>In Transit</th>
                <th>Out for Delivery</th>
              </tr>
            </thead>
            <tbody>
              {reportData.facilities.map((facility) => (
                <tr key={facility.facility_id}>
                  <td>{facility.facility_id}</td>
                  <td>{facility.facility_name}</td>
                  <td>{facility.facility_address}</td>
                  <td>{facility.packages_received}</td>
                  <td>{facility.packages_delivered}</td>
                  <td>{facility.packages_lost}</td>
                  <td><span className={facility.lost_package_rate > 5 ? 'rate needs-improvement' : 'rate good'}>{facility.lost_package_rate}%</span></td>
                  <td>{facility.avg_delivery_days != null ? Number(facility.avg_delivery_days).toFixed(1) : '0.0'}</td>
                  <td className={facility.current_backlog > 50 ? 'backlog-critical' : facility.current_backlog > 20 ? 'backlog-warning' : ''}>{facility.current_backlog}</td>
                  <td>{facility.status_processing}</td>
                  <td>{facility.status_in_transit}</td>
                  <td>{facility.status_out_for_delivery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderClerkReport = () => {
    if (!reportData || !reportData.clerks) return <div>No data available</div>;

    return (
      <div className="reportContent">
        <div className="reportHeader">
          <h2>Clerk Report</h2>
          <p>Clerk performance, reviews, and tracking activity</p>

          <div className="dateRangeSelector">
            <div className="dateInput">
              <label>End Date (higher):</label>
              <input
                type="date"
                value={clerkStartDate}
                onChange={(e) => setClerkStartDate(e.target.value)}
              />
            </div>
            <div className="dateInput">
              <label>Start Date (lower):</label>
              <input
                type="date"
                value={clerkEndDate}
                onChange={(e) => setClerkEndDate(e.target.value)}
              />
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
                <th>Avg Review Time (hrs)</th>
                <th>Activity/Day</th>
              </tr>
            </thead>
            <tbody>
              {reportData.clerks.map((clerk) => (
                <tr key={clerk.employee_id}>
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
                  <td>{clerk.avg_review_time_hours != null ? Number(clerk.avg_review_time_hours).toFixed(1) : '0.0'}</td>
                  <td>{clerk.activity_per_day}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCourierReport = () => {
    if (!reportData || !reportData.couriers) return <div>No data available</div>;

    return (
      <div className="reportContent">
        <div className="reportHeader">
          <h2>Courier Report</h2>
          <p>Courier performance, deliveries, and package handling metrics</p>

          <div className="dateRangeSelector">
            <div className="dateInput">
              <label>End Date (higher):</label>
              <input
                type="date"
                value={courierStartDate}
                onChange={(e) => setCourierStartDate(e.target.value)}
              />
            </div>
            <div className="dateInput">
              <label>Start Date (lower):</label>
              <input
                type="date"
                value={courierEndDate}
                onChange={(e) => setCourierEndDate(e.target.value)}
              />
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
              <div className="statValue">{reportData.summary.overall_delivery_rate}%</div>
              <div className="statLabel">Delivery Rate</div>
            </div>
            <div className="statCard">
              <div className="statValue">{reportData.summary.overall_lost_rate}%</div>
              <div className="statLabel">Lost Rate</div>
            </div>
            <div className="statCard">
              <div className="statValue">{reportData.summary.avg_delivery_days}</div>
              <div className="statLabel">Avg Delivery Days</div>
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
                <th>In Transit</th>
                <th>Lost</th>
                <th>Delivery Rate</th>
                <th>Lost Rate</th>
                <th>Total Moves</th>
                <th>Facility Transfers</th>
                <th>Final Deliveries</th>
                <th>Avg Days</th>
                <th>Avg Time Between Moves</th>
                <th>On-Time Rate</th>
                <th>Request Approval Rate</th>
                <th>Pkgs/Day</th>
              </tr>
            </thead>
            <tbody>
              {reportData.couriers.map((courier) => (
                <tr key={courier.employee_id}>
                  <td>{courier.employee_id}</td>
                  <td>{courier.courier_name}</td>
                  <td>{courier.packages_claimed}</td>
                  <td>{courier.packages_delivered}</td>
                  <td>{courier.packages_in_transit}</td>
                  <td>{courier.packages_lost}</td>
                  <td><span className={courier.delivery_success_rate >= 90 ? 'rate excellent' : courier.delivery_success_rate >= 75 ? 'rate good' : 'rate needs-improvement'}>{courier.delivery_success_rate}%</span></td>
                  <td><span className={courier.lost_package_rate > 5 ? 'rate needs-improvement' : 'rate good'}>{courier.lost_package_rate}%</span></td>
                  <td>{courier.total_moves}</td>
                  <td>{courier.facility_transfers}</td>
                  <td>{courier.final_deliveries}</td>
                  <td>{courier.avg_delivery_days != null ? Number(courier.avg_delivery_days).toFixed(1) : '0.0'}</td>
                  <td>{courier.avg_time_between_moves != null ? Number(courier.avg_time_between_moves).toFixed(1) : '0.0'} hrs</td>
                  <td><span className={courier.on_time_rate >= 80 ? 'rate excellent' : courier.on_time_rate >= 60 ? 'rate good' : 'rate needs-improvement'}>{courier.on_time_rate}%</span></td>
                  <td>{courier.request_approval_rate}%</td>
                  <td>{courier.packages_per_day}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="reportPageContainer">
      
      <div className="reportPageContent">
        {/* Left side accordion menu */}
        <div className="reportMenu">
          <div
            className={`reportMenuItem ${activeReport === 'facility' ? 'active' : ''}`}
            onClick={() => setActiveReport('facility')}
          >
            <div className="menuItemTitle">Facility Report</div>
            <div className="menuItemDesc">Performance, throughput, and backlog</div>
          </div>

          <div
            className={`reportMenuItem ${activeReport === 'clerk' ? 'active' : ''}`}
            onClick={() => setActiveReport('clerk')}
          >
            <div className="menuItemTitle">Clerk Report</div>
            <div className="menuItemDesc">Reviews, approvals, and activity</div>
          </div>

          <div
            className={`reportMenuItem ${activeReport === 'courier' ? 'active' : ''}`}
            onClick={() => setActiveReport('courier')}
          >
            <div className="menuItemTitle">Courier Report</div>
            <div className="menuItemDesc">Deliveries and performance metrics</div>
          </div>
        </div>

        {/* Right side report display */}
        <div className="reportDisplay">
          {loading ? (
            <div className="loadingMessage">Loading report...</div>
          ) : reportData ? (
            <>
              {activeReport === 'facility' && renderFacilityReport()}
              {activeReport === 'clerk' && renderClerkReport()}
              {activeReport === 'courier' && renderCourierReport()}
            </>
          ) : (
            <div className="loadingMessage">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
