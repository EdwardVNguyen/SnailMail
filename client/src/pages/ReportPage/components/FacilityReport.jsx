import { useState, useMemo } from 'react';
import { sortData, getSortIndicator } from './reportUtils';

const FacilityReport = ({
  reportData,
  facilityStartDate,
  facilityEndDate,
  setFacilityStartDate,
  setFacilityEndDate,
  setFacilityDateRange,
  facilitySortField,
  facilitySortDirection,
  handleFacilitySort,
  handleFacilityRowClick
}) => {
  // Filter states
  const [facilitySearch, setFacilitySearch] = useState('');
  const [minReceivedPackages, setMinReceivedPackages] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  // Filter facilities based on selected filters
  const filteredFacilities = useMemo(() => {
    if (!reportData?.facilities) return [];
    let filtered = reportData.facilities;

    if (statusFilter === 'active') {
      filtered = filtered.filter(f => f.status === 'active');
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(f => f.status === 'inactive');
    }

    if (facilitySearch) {
      filtered = filtered.filter(f =>
        f.facility_name.toLowerCase().includes(facilitySearch.toLowerCase())
      );
    }

    if (minReceivedPackages !== '') {
      filtered = filtered.filter(f => f.packages_received >= parseInt(minReceivedPackages));
    }

    return filtered;
  }, [reportData?.facilities, facilitySearch, minReceivedPackages, statusFilter]);

  if (!reportData || !reportData.facilities) return <div>No data available</div>;

  // Sort the filtered facilities data
  const sortedFacilities = sortData(filteredFacilities, facilitySortField, facilitySortDirection);

  const clearFilters = () => {
    setFacilitySearch('');
    setMinReceivedPackages('');
    setStatusFilter('all');
  };

  return (
    <div className="reportContent">
      <div className="reportHeader">
        <h2>Facility Report</h2>
        <p>Comprehensive facility performance and metrics (Click a row for details)</p>

        <div className="dateRangeSelector">
          <div className="dateInput">
            <label>From:</label>
            <input
              type="date"
              value={facilityStartDate}
              onChange={(e) => setFacilityStartDate(e.target.value)}
            />
          </div>
          <div className="dateInput">
            <label>To:</label>
            <input
              type="date"
              value={facilityEndDate}
              onChange={(e) => setFacilityEndDate(e.target.value)}
            />
          </div>
          <div className="datePresetButtons">
            <button onClick={() => setFacilityDateRange('week')} className="presetButton">1 Week</button>
            <button onClick={() => setFacilityDateRange('month')} className="presetButton">1 Month</button>
            <button onClick={() => setFacilityDateRange('year')} className="presetButton">1 Year</button>
            <button onClick={() => setFacilityDateRange('all')} className="presetButton">All Time</button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filterSection">
          <h3 style={{ margin: '0 0 15px 0' }}>Filters</h3>
          <div className="filterControls">
            <div className="filterGroup">
              <label>Facility Name:</label>
              <input
                type="text"
                value={facilitySearch}
                onChange={(e) => setFacilitySearch(e.target.value)}
                placeholder="Search facilities..."
                className="filterInput"
              />
            </div>

            <div className="filterGroup">
              <label>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filterInput"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="filterGroup">
              <label>Min Received:</label>
              <input
                type="number"
                value={minReceivedPackages}
                onChange={(e) => setMinReceivedPackages(e.target.value)}
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
            <div className="statValue">{reportData.summary.total_received}</div>
            <div className="statLabel">Total Received</div>
          </div>
          <div className="statCard">
            <div className="statValue">{reportData.summary.total_sent}</div>
            <div className="statLabel">Total Sent</div>
          </div>
          <div className="statCard">
            <div className="statValue">{reportData.summary.total_delivered}</div>
            <div className="statLabel">Total Delivered</div>
          </div>
          <div className="statCard">
            <div className="statValue">{reportData.summary.total_lost}</div>
            <div className="statLabel">Lost Packages</div>
          </div>
        </div>
      </div>

      <div className="tableContainer">
        <table className="reportTable">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleFacilitySort('facility_id')}>
                Facility ID{getSortIndicator('facility_id', facilitySortField, facilitySortDirection)}
              </th>
              <th className="sortable" onClick={() => handleFacilitySort('facility_name')}>
                Facility Name{getSortIndicator('facility_name', facilitySortField, facilitySortDirection)}
              </th>
              <th className="sortable" onClick={() => handleFacilitySort('facility_address')}>
                Address{getSortIndicator('facility_address', facilitySortField, facilitySortDirection)}
              </th>
              <th className="sortable" onClick={() => handleFacilitySort('packages_received')}>
                Received{getSortIndicator('packages_received', facilitySortField, facilitySortDirection)}
              </th>
              <th>Sent</th>
              <th className="sortable" onClick={() => handleFacilitySort('packages_delivered')}>
                Delivered{getSortIndicator('packages_delivered', facilitySortField, facilitySortDirection)}
              </th>
              <th className="sortable" onClick={() => handleFacilitySort('packages_lost')}>
                Lost{getSortIndicator('packages_lost', facilitySortField, facilitySortDirection)}
              </th>
              <th className="sortable" onClick={() => handleFacilitySort('status_in_transit')}>
                In Transit{getSortIndicator('status_in_transit', facilitySortField, facilitySortDirection)}
              </th>
              <th>Throughput</th>
            </tr>
          </thead>
          <tbody>
            {sortedFacilities.map((facility) => (
              <tr
                key={facility.facility_id}
                onClick={() => handleFacilityRowClick(facility)}
                className="clickable-row"
                style={facility.status === 'inactive' ? { opacity: 0.5 } : {}}
              >
                <td>{facility.facility_id}</td>
                <td>{facility.facility_name}</td>
                <td>{facility.facility_address}</td>
                <td>{facility.packages_received}</td>
                <td>{facility.packages_sent}</td>
                <td>{facility.packages_delivered}</td>
                <td>{facility.packages_lost}</td>
                <td>{facility.status_in_transit}</td>
                <td>
                  {(() => {
                    const packagesIn = facility.packages_received;
                    const packagesOut = facility.packages_sent + facility.packages_delivered;
                    const net = packagesIn - packagesOut;
                    return (
                      <span className={packagesOut >= packagesIn ? 'rate excellent' : 'rate needs-improvement'}>
                        {packagesIn} / {packagesOut}
                      </span>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacilityReport;
