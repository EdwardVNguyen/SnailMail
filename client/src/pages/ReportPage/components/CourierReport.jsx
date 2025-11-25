import { useState, useMemo } from 'react';
import { sortData, getSortIndicator } from './reportUtils';

const CourierReport = ({
  reportData,
  courierStartDate,
  courierEndDate,
  setCourierStartDate,
  setCourierEndDate,
  setCourierDateRange,
  courierSortField,
  courierSortDirection,
  handleCourierSort,
  handleCourierRowClick
}) => {
  // Filter states
  const [courierSearch, setCourierSearch] = useState('');
  const [facilitySearch, setFacilitySearch] = useState('');
  const [minClaimed, setMinClaimed] = useState('');
  const [minLost, setMinLost] = useState('');

  // Filter couriers based on selected filters
  const filteredCouriers = useMemo(() => {
    if (!reportData?.couriers) return [];
    let filtered = reportData.couriers;

    if (courierSearch) {
      filtered = filtered.filter(c =>
        c.courier_name.toLowerCase().includes(courierSearch.toLowerCase())
      );
    }

    if (facilitySearch) {
      filtered = filtered.filter(c =>
        c.facility_name?.toLowerCase().includes(facilitySearch.toLowerCase())
      );
    }

    if (minClaimed !== '') {
      filtered = filtered.filter(c => c.packages_claimed >= parseInt(minClaimed));
    }

    if (minLost !== '') {
      filtered = filtered.filter(c => c.packages_lost >= parseInt(minLost));
    }

    return filtered;
  }, [reportData?.couriers, courierSearch, facilitySearch, minClaimed, minLost]);

  if (!reportData || !reportData.couriers) return <div>No data available</div>;

  // Sort the filtered couriers data
  const sortedCouriers = sortData(filteredCouriers, courierSortField, courierSortDirection);

  const clearFilters = () => {
    setCourierSearch('');
    setFacilitySearch('');
    setMinClaimed('');
    setMinLost('');
  };

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

        {/* Filter Section */}
        <div className="filterSection">
          <h3>Filters</h3>
          <div className="filterControls">
            <div className="filterGroup">
              <label>Courier Name:</label>
              <input
                type="text"
                value={courierSearch}
                onChange={(e) => setCourierSearch(e.target.value)}
                placeholder="Search couriers..."
                className="filterInput"
              />
            </div>

            <div className="filterGroup">
              <label>Facility:</label>
              <input
                type="text"
                value={facilitySearch}
                onChange={(e) => setFacilitySearch(e.target.value)}
                placeholder="Search facilities..."
                className="filterInput"
              />
            </div>

            <div className="filterGroup">
              <label>Min Claimed:</label>
              <input
                type="number"
                value={minClaimed}
                onChange={(e) => setMinClaimed(e.target.value)}
                placeholder="0"
                min="0"
                className="filterInput"
              />
            </div>

            <div className="filterGroup">
              <label>Min Lost:</label>
              <input
                type="number"
                value={minLost}
                onChange={(e) => setMinLost(e.target.value)}
                placeholder="0"
                min="0"
                className="filterInput"
              />
            </div>

            <button onClick={clearFilters} className="clearFiltersButton">
              Clear Filters
            </button>
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
            <div className="statValue">{reportData.summary.total_late_delivery}</div>
            <div className="statLabel">Late Deliveries</div>
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
              <th className="sortable" onClick={() => handleCourierSort('employee_id')}>
                Employee ID{getSortIndicator('employee_id', courierSortField, courierSortDirection)}
              </th>
              <th className="sortable" onClick={() => handleCourierSort('courier_name')}>
                Courier Name{getSortIndicator('courier_name', courierSortField, courierSortDirection)}
              </th>
              <th className="sortable" onClick={() => handleCourierSort('facility_name')}>
                Facility{getSortIndicator('facility_name', courierSortField, courierSortDirection)}
              </th>
              <th className="sortable" onClick={() => handleCourierSort('packages_claimed')}>
                Claimed{getSortIndicator('packages_claimed', courierSortField, courierSortDirection)}
              </th>
              <th className="sortable" onClick={() => handleCourierSort('final_deliveries')}>
                Final Deliveries{getSortIndicator('final_deliveries', courierSortField, courierSortDirection)}
              </th>
              <th className="sortable" onClick={() => handleCourierSort('packages_lost')}>
                Lost{getSortIndicator('packages_lost', courierSortField, courierSortDirection)}
              </th>
              <th className="sortable" onClick={() => handleCourierSort('packages_late_delivery')}>
                Late{getSortIndicator('packages_late_delivery', courierSortField, courierSortDirection)}
              </th>
              <th className="sortable" onClick={() => handleCourierSort('facility_transfers')}>
                Facility Transfers{getSortIndicator('facility_transfers', courierSortField, courierSortDirection)}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCouriers.map((courier) => (
              <tr
                key={courier.employee_id}
                onClick={() => handleCourierRowClick(courier)}
                className="clickable-row"
              >
                <td>{courier.employee_id}</td>
                <td>{courier.courier_name}</td>
                <td>{courier.facility_name}</td>
                <td>{courier.packages_claimed}</td>
                <td>{courier.final_deliveries}</td>
                <td>{courier.packages_lost}</td>
                <td>{courier.packages_late_delivery}</td>
                <td>{courier.facility_transfers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourierReport;
