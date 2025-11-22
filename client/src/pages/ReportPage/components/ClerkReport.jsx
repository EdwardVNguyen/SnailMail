import { useState, useMemo } from 'react';
import { sortData, getSortIndicator } from './reportUtils';

const ClerkReport = ({
  reportData,
  clerkStartDate,
  clerkEndDate,
  setClerkStartDate,
  setClerkEndDate,
  setClerkDateRange,
  clerkSortField,
  clerkSortDirection,
  handleClerkSort,
  handleClerkRowClick
}) => {
  // Filter states
  const [clerkSearch, setClerkSearch] = useState('');
  const [facilitySearch, setFacilitySearch] = useState('');
  const [minReviews, setMinReviews] = useState('');
  const [minApprovalRate, setMinApprovalRate] = useState('');

  // Filter clerks based on selected filters
  const filteredClerks = useMemo(() => {
    if (!reportData?.clerks) return [];
    let filtered = reportData.clerks;

    if (clerkSearch) {
      filtered = filtered.filter(c =>
        c.clerk_name.toLowerCase().includes(clerkSearch.toLowerCase())
      );
    }

    if (facilitySearch) {
      filtered = filtered.filter(c =>
        c.facility_name.toLowerCase().includes(facilitySearch.toLowerCase())
      );
    }

    if (minReviews !== '') {
      filtered = filtered.filter(c => c.total_reviews >= parseInt(minReviews));
    }

    if (minApprovalRate !== '') {
      filtered = filtered.filter(c => c.approval_rate >= parseFloat(minApprovalRate));
    }

    return filtered;
  }, [reportData?.clerks, clerkSearch, facilitySearch, minReviews, minApprovalRate]);

  if (!reportData || !reportData.clerks) return <div>No data available</div>;

  // Sort the filtered clerks data
  const sortedClerks = sortData(filteredClerks, clerkSortField, clerkSortDirection);

  const clearFilters = () => {
    setClerkSearch('');
    setFacilitySearch('');
    setMinReviews('');
    setMinApprovalRate('');
  };

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

        {/* Filter Section */}
        <div className="filterSection">
          <h3>Filters</h3>
          <div className="filterControls">
            <div className="filterGroup">
              <label>Clerk Name:</label>
              <input
                type="text"
                value={clerkSearch}
                onChange={(e) => setClerkSearch(e.target.value)}
                placeholder="Search clerks..."
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
              <label>Min Reviews:</label>
              <input
                type="number"
                value={minReviews}
                onChange={(e) => setMinReviews(e.target.value)}
                placeholder="0"
                min="0"
                className="filterInput"
              />
            </div>

            <div className="filterGroup">
              <label>Min Approval %:</label>
              <input
                type="number"
                value={minApprovalRate}
                onChange={(e) => setMinApprovalRate(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
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
              <th className="sortable" onClick={() => handleClerkSort('employee_id')}>
                Employee ID{getSortIndicator('employee_id', clerkSortField, clerkSortDirection)}
              </th>
              <th className="sortable" onClick={() => handleClerkSort('clerk_name')}>
                Clerk Name{getSortIndicator('clerk_name', clerkSortField, clerkSortDirection)}
              </th>
              <th className="sortable" onClick={() => handleClerkSort('facility_name')}>
                Facility{getSortIndicator('facility_name', clerkSortField, clerkSortDirection)}
              </th>
              <th className="sortable" onClick={() => handleClerkSort('total_reviews')}>
                Reviews{getSortIndicator('total_reviews', clerkSortField, clerkSortDirection)}
              </th>
              <th className="sortable" onClick={() => handleClerkSort('reviews_approved')}>
                Approved{getSortIndicator('reviews_approved', clerkSortField, clerkSortDirection)}
              </th>
              <th className="sortable" onClick={() => handleClerkSort('reviews_rejected')}>
                Rejected{getSortIndicator('reviews_rejected', clerkSortField, clerkSortDirection)}
              </th>
              <th className="sortable" onClick={() => handleClerkSort('approval_rate')}>
                Approval Rate{getSortIndicator('approval_rate', clerkSortField, clerkSortDirection)}
              </th>
              <th className="sortable" onClick={() => handleClerkSort('events_total')}>
                Events Created{getSortIndicator('events_total', clerkSortField, clerkSortDirection)}
              </th>
              <th className="sortable" onClick={() => handleClerkSort('problem_packages')}>
                Problem Pkgs{getSortIndicator('problem_packages', clerkSortField, clerkSortDirection)}
              </th>
              <th className="sortable" onClick={() => handleClerkSort('unique_packages_processed')}>
                Packages Processed{getSortIndicator('unique_packages_processed', clerkSortField, clerkSortDirection)}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedClerks.map((clerk) => (
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
