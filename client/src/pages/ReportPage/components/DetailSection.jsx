import { sortData, getSortIndicator } from './reportUtils';

const DetailSection = ({
  sectionKey,
  title,
  description = null,
  data,
  extraColumn = null,
  collapsedSections,
  detailPages,
  detailSortField,
  detailSortDirection,
  onSectionToggle,
  onDetailSort,
  onPageChange
}) => {
  if (!data || data.length === 0) return null;

  const isCollapsed = collapsedSections[sectionKey];
  const currentPage = detailPages[sectionKey] || 1;
  const itemsPerPage = 50;
  const sortField = detailSortField[sectionKey] || 'tracking_number';
  const sortDirection = detailSortDirection[sectionKey] || 'asc';

  // Support both single extraColumn object and array of extraColumns
  const extraColumns = extraColumn ? (Array.isArray(extraColumn) ? extraColumn : [extraColumn]) : [];

  // Sort the data
  const sortedData = sortData(data, sortField, sortDirection);

  // Paginate the data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  return (
    <div key={sectionKey} className="detailSection">
      <div className="detailSectionHeader" onClick={() => onSectionToggle(sectionKey)}>
        <h3>
          {isCollapsed ? '▶' : '▼'} {title} ({data.length})
        </h3>
      </div>
      {!isCollapsed && (
        <div className="detailSectionContent">
          {description && <p className="detailSectionDescription">{description}</p>}
          <div className="detailTableContainer">
            <table className="detailTable">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => onDetailSort(sectionKey, 'tracking_number')}>
                    Tracking #{getSortIndicator('tracking_number', sortField, sortDirection)}
                  </th>
                  <th className="sortable" onClick={() => onDetailSort(sectionKey, 'sender_name')}>
                    Sender{getSortIndicator('sender_name', sortField, sortDirection)}
                  </th>
                  <th className="sortable" onClick={() => onDetailSort(sectionKey, 'recipient_name')}>
                    Recipient{getSortIndicator('recipient_name', sortField, sortDirection)}
                  </th>
                  <th className="sortable" onClick={() => onDetailSort(sectionKey, 'package_type')}>
                    Type{getSortIndicator('package_type', sortField, sortDirection)}
                  </th>
                  <th className="sortable" onClick={() => onDetailSort(sectionKey, 'package_status')}>
                    Status{getSortIndicator('package_status', sortField, sortDirection)}
                  </th>
                  {extraColumns.map((col, idx) => (
                    <th key={idx} className="sortable" onClick={() => onDetailSort(sectionKey, col.field)}>
                      {col.label}{getSortIndicator(col.field, sortField, sortDirection)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((pkg, index) => {
                  // Create a stable unique key
                  let uniqueKey;
                  if (pkg.request_id) {
                    uniqueKey = pkg.request_id;
                  } else if (pkg.event_time && pkg.event_type) {
                    // For tracking events, use composite key
                    uniqueKey = `${pkg.package_id}-${pkg.event_type}-${pkg.event_time}`;
                  } else {
                    uniqueKey = pkg.package_id || pkg.tracking_number || index;
                  }
                  return (
                    <tr key={`${sectionKey}-${uniqueKey}`}>
                      <td>{pkg.tracking_number}</td>
                      <td>{pkg.sender_name}</td>
                      <td>{pkg.recipient_name}</td>
                      <td>{pkg.package_type}</td>
                      <td><span className={`status ${pkg.package_status}`}>{pkg.package_status}</span></td>
                      {extraColumns.map((col, idx) => (
                        <td key={idx}>{pkg[col.field]}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="paginationControls">
              <button
                onClick={() => onPageChange(sectionKey, 'prev')}
                disabled={currentPage === 1}
                className="paginationButton"
              >
                Previous
              </button>
              <span className="pageInfo">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => onPageChange(sectionKey, 'next')}
                disabled={currentPage === totalPages}
                className="paginationButton"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DetailSection;
