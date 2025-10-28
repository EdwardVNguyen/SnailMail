import { useState, useEffect } from 'react';
import './ReportPage.css';

const ReportPage = ({ globalAuthId }) => {
  const [activeReport, setActiveReport] = useState('problems');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Fetch report data when active report changes
  useEffect(() => {
    let cancelled = false;

    const fetchReportData = async (reportType) => {
      setLoading(true);
      setReportData(null); // Clear previous data

      try {
        let endpoint = '';
        switch (reportType) {
          case 'problems':
            endpoint = 'getProblemsReport';
            break;
          case 'backlog':
            endpoint = 'getFacilityBacklogReport';
            break;
          case 'delivery':
            endpoint = 'getDeliveryTimeReport';
            break;
          case 'courier':
            endpoint = 'getCourierPerformanceReport';
            break;
          default:
            endpoint = 'getProblemsReport';
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`);
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
  }, [activeReport]);

  const renderProblemsReport = () => {
    if (!reportData || !reportData.packages) return <div>No data available</div>;

    return (
      <div className="reportContent">
        <div className="reportHeader">
          <h2>Problem Packages Report</h2>
          <p>Packages with issues: Returned, Undeliverable, Failed Delivery, Lost, or Damaged</p>
          <div className="reportStats">
            <div className="statCard">
              <div className="statValue">{reportData.count}</div>
              <div className="statLabel">Total Problem Packages</div>
            </div>
          </div>
        </div>

        <div className="tableContainer">
          <table className="reportTable">
            <thead>
              <tr>
                <th>Package ID</th>
                <th>Recipient</th>
                <th>Status</th>
                <th>Type</th>
                <th>Weight (lbs)</th>
                <th>Days Old</th>
                <th>Sender Address</th>
                <th>Recipient Address</th>
              </tr>
            </thead>
            <tbody>
              {reportData.packages.map((pkg) => (
                <tr key={pkg.package_id}>
                  <td>{pkg.package_id}</td>
                  <td>{pkg.recipient_name}</td>
                  <td><span className={`status ${pkg.package_status.replace(/\s+/g, '-').toLowerCase()}`}>{pkg.package_status}</span></td>
                  <td>{pkg.package_type}</td>
                  <td>{pkg.weight}</td>
                  <td>{pkg.days_since_creation}</td>
                  <td>{pkg.sender_address}</td>
                  <td>{pkg.recipient_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBacklogReport = () => {
    if (!reportData || !reportData.facilities) return <div>No data available</div>;

    return (
      <div className="reportContent">
        <div className="reportHeader">
          <h2>Facility Backlog Report</h2>
          <p>Facilities with package processing backlogs (last 30 days)</p>
          <div className="reportStats">
            <div className="statCard">
              <div className="statValue">{reportData.count}</div>
              <div className="statLabel">Total Facilities</div>
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
                <th>Packages In (30d)</th>
                <th>Packages Out (30d)</th>
                <th>Current Backlog</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.facilities.map((facility) => {
                const backlog = facility.backlog;
                const backlogStatus = backlog > 50 ? 'critical' : backlog > 20 ? 'warning' : 'normal';

                return (
                  <tr key={facility.facility_id}>
                    <td>{facility.facility_id}</td>
                    <td>{facility.facility_name}</td>
                    <td>{facility.facility_address}</td>
                    <td>{facility.packages_in}</td>
                    <td>{facility.packages_out}</td>
                    <td className={`backlog-${backlogStatus}`}>{backlog}</td>
                    <td><span className={`status ${backlogStatus}`}>
                      {backlogStatus === 'critical' ? 'Critical' : backlogStatus === 'warning' ? 'Warning' : 'Normal'}
                    </span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDeliveryTimeReport = () => {
    if (!reportData || !reportData.packages) return <div>No data available</div>;

    return (
      <div className="reportContent">
        <div className="reportHeader">
          <h2>Average Delivery Time Report</h2>
          <p>Delivered packages in the last 90 days</p>
          <div className="reportStats">
            <div className="statCard">
              <div className="statValue">{reportData.stats.average_days}</div>
              <div className="statLabel">Average Days</div>
            </div>
            <div className="statCard">
              <div className="statValue">{reportData.stats.min_days}</div>
              <div className="statLabel">Fastest Delivery</div>
            </div>
            <div className="statCard">
              <div className="statValue">{reportData.stats.max_days}</div>
              <div className="statLabel">Slowest Delivery</div>
            </div>
            <div className="statCard">
              <div className="statValue">{reportData.stats.total_packages}</div>
              <div className="statLabel">Total Packages</div>
            </div>
          </div>
        </div>

        <div className="tableContainer">
          <table className="reportTable">
            <thead>
              <tr>
                <th>Package ID</th>
                <th>Recipient</th>
                <th>Type</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Ship Date</th>
                <th>Delivery Date</th>
                <th>Days to Deliver</th>
              </tr>
            </thead>
            <tbody>
              {reportData.packages.map((pkg) => (
                <tr key={pkg.package_id}>
                  <td>{pkg.package_id}</td>
                  <td>{pkg.recipient_name}</td>
                  <td>{pkg.package_type}</td>
                  <td>{pkg.origin}</td>
                  <td>{pkg.destination}</td>
                  <td>{new Date(pkg.ship_date).toLocaleDateString()}</td>
                  <td>{new Date(pkg.last_updated).toLocaleDateString()}</td>
                  <td className={pkg.delivery_days > 7 ? 'slow-delivery' : ''}>{pkg.delivery_days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCourierPerformanceReport = () => {
    if (!reportData || !reportData.couriers) return <div>No data available</div>;

    return (
      <div className="reportContent">
        <div className="reportHeader">
          <h2>Courier Performance Report</h2>
          <p>Courier statistics for the last 90 days</p>
          <div className="reportStats">
            <div className="statCard">
              <div className="statValue">{reportData.count}</div>
              <div className="statLabel">Active Couriers</div>
            </div>
          </div>
        </div>

        <div className="tableContainer">
          <table className="reportTable">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Courier Name</th>
                <th>Phone Number</th>
                <th>Total Packages</th>
                <th>Delivered</th>
                <th>In Transit</th>
                <th>Out for Delivery</th>
                <th>Delivery Rate</th>
                <th>Avg. Days</th>
              </tr>
            </thead>
            <tbody>
              {reportData.couriers.map((courier) => {
                const rateClass = courier.delivery_rate >= 90 ? 'excellent' : courier.delivery_rate >= 75 ? 'good' : 'needs-improvement';

                return (
                  <tr key={courier.employee_id}>
                    <td>{courier.employee_id}</td>
                    <td>{courier.courier_name}</td>
                    <td>{courier.phone_number || 'N/A'}</td>
                    <td>{courier.total_packages}</td>
                    <td>{courier.delivered_packages}</td>
                    <td>{courier.in_transit_packages}</td>
                    <td>{courier.out_for_delivery_packages}</td>
                    <td><span className={`rate ${rateClass}`}>{courier.delivery_rate}%</span></td>
                    <td>{courier.avg_delivery_days ? courier.avg_delivery_days.toFixed(1) : 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="reportPageContainer">
      <div className="reportPageHeader">
        <h1>Manager Reports</h1>
        <p>System overview and operational statistics</p>
      </div>

      <div className="reportPageContent">
        {/* Left side accordion menu */}
        <div className="reportMenu">
          <div
            className={`reportMenuItem ${activeReport === 'problems' ? 'active' : ''}`}
            onClick={() => setActiveReport('problems')}
          >
            <div className="menuItemTitle">Problem Packages</div>
            <div className="menuItemDesc">Returned & undeliverable items</div>
          </div>

          <div
            className={`reportMenuItem ${activeReport === 'backlog' ? 'active' : ''}`}
            onClick={() => setActiveReport('backlog')}
          >
            <div className="menuItemTitle">Facility Backlogs</div>
            <div className="menuItemDesc">Facility capacity analysis</div>
          </div>

          <div
            className={`reportMenuItem ${activeReport === 'delivery' ? 'active' : ''}`}
            onClick={() => setActiveReport('delivery')}
          >
            <div className="menuItemTitle">Delivery Times</div>
            <div className="menuItemDesc">Average delivery performance</div>
          </div>

          <div
            className={`reportMenuItem ${activeReport === 'courier' ? 'active' : ''}`}
            onClick={() => setActiveReport('courier')}
          >
            <div className="menuItemTitle">Courier Performance</div>
            <div className="menuItemDesc">Employee delivery metrics</div>
          </div>
        </div>

        {/* Right side report display */}
        <div className="reportDisplay">
          {loading ? (
            <div className="loadingMessage">Loading report...</div>
          ) : reportData ? (
            <>
              {activeReport === 'problems' && renderProblemsReport()}
              {activeReport === 'backlog' && renderBacklogReport()}
              {activeReport === 'delivery' && renderDeliveryTimeReport()}
              {activeReport === 'courier' && renderCourierPerformanceReport()}
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
