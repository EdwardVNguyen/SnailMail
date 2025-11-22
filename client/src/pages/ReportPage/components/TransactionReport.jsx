import { useState, useMemo } from 'react';
import { sortData, getSortIndicator } from './reportUtils';

// Error statuses that should be treated as refunds
const ERROR_STATUSES = ['lost', 'damaged', 'undeliverable', 'failed-delivery', 'returned'];

const TransactionReport = ({
  reportData,
  transactionStartDate,
  transactionEndDate,
  setTransactionStartDate,
  setTransactionEndDate,
  setTransactionDateRange
}) => {
  // Filter states
  const [facilitySearch, setFacilitySearch] = useState('');
  const [selectedPackageType, setSelectedPackageType] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Sorting states
  const [sortField, setSortField] = useState('transaction_date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Extract unique package types for filters
  const packageTypes = useMemo(() => {
    if (!reportData?.transactions) return [];
    return [...new Set(reportData.transactions.map(t => t.package_type))].sort();
  }, [reportData?.transactions]);

  // Filter transactions based on selected filters
  const filteredTransactions = useMemo(() => {
    if (!reportData?.transactions) return [];
    let filtered = reportData.transactions;

    if (facilitySearch) {
      filtered = filtered.filter(t =>
        t.facility_name.toLowerCase().includes(facilitySearch.toLowerCase())
      );
    }

    if (selectedPackageType !== 'all') {
      filtered = filtered.filter(t => t.package_type === selectedPackageType);
    }

    if (minPrice !== '') {
      filtered = filtered.filter(t => parseFloat(t.transaction_amount) >= parseFloat(minPrice));
    }

    if (maxPrice !== '') {
      filtered = filtered.filter(t => parseFloat(t.transaction_amount) <= parseFloat(maxPrice));
    }

    return filtered;
  }, [reportData?.transactions, facilitySearch, selectedPackageType, minPrice, maxPrice]);

  // Calculate filtered summary stats
  const filteredSummary = useMemo(() => {
    let totalRevenue = 0;
    let totalRefunded = 0;

    filteredTransactions.forEach(t => {
      const amount = parseFloat(t.transaction_amount);
      if (ERROR_STATUSES.includes(t.package_status)) {
        totalRefunded += amount;
      } else {
        totalRevenue += amount;
      }
    });

    return {
      count: filteredTransactions.length,
      totalRevenue: totalRevenue,
      totalRefunded: totalRefunded
    };
  }, [filteredTransactions]);

  if (!reportData || !reportData.transactions) return <div>No data available</div>;

  // Sort the filtered transactions
  const sortedTransactions = sortData(filteredTransactions, sortField, sortDirection);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setFacilitySearch('');
    setSelectedPackageType('all');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="reportContent">
      <div className="reportHeader">
        <h2>Transaction Report</h2>
        <p>Financial transactions by facility, package type, and customer</p>

        <div className="dateRangeSelector">
          <div className="dateInput">
            <label>From:</label>
            <input
              type="date"
              value={transactionStartDate}
              max={transactionEndDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => setTransactionStartDate(e.target.value)}
            />
          </div>
          <div className="dateInput">
            <label>To:</label>
            <input
              type="date"
              value={transactionEndDate}
              min={transactionStartDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setTransactionEndDate(e.target.value)}
            />
          </div>
          <div className="datePresetButtons">
            <button onClick={() => setTransactionDateRange('week')} className="presetButton">1 Week</button>
            <button onClick={() => setTransactionDateRange('month')} className="presetButton">1 Month</button>
            <button onClick={() => setTransactionDateRange('year')} className="presetButton">1 Year</button>
            <button onClick={() => setTransactionDateRange('all')} className="presetButton">All Time</button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filterSection">
          <h3>Filters</h3>
          <div className="filterControls">
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
              <label>Package Type:</label>
              <select
                value={selectedPackageType}
                onChange={(e) => setSelectedPackageType(e.target.value)}
                className="filterSelect"
              >
                <option value="all">All Types</option>
                {packageTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filterGroup">
              <label>Min Price:</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="filterInput"
              />
            </div>

            <div className="filterGroup">
              <label>Max Price:</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="No limit"
                min="0"
                step="0.01"
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
            <div className="statValue">{filteredSummary.count}</div>
            <div className="statLabel">Transactions</div>
          </div>
          <div className="statCard">
            <div className="statValue">{formatCurrency(filteredSummary.totalRevenue)}</div>
            <div className="statLabel">Total Revenue</div>
          </div>
          <div className="statCard">
            <div className="statValue" style={{ color: '#dc2626' }}>{formatCurrency(filteredSummary.totalRefunded)}</div>
            <div className="statLabel">Total Refunded</div>
          </div>
        </div>
      </div>

      <div className="tableContainer">
        <table className="reportTable">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('transaction_id')}>
                Transaction ID{getSortIndicator('transaction_id', sortField, sortDirection)}
              </th>
              <th className="sortable" onClick={() => handleSort('transaction_date')}>
                Date{getSortIndicator('transaction_date', sortField, sortDirection)}
              </th>
              <th className="sortable" onClick={() => handleSort('facility_name')}>
                Facility{getSortIndicator('facility_name', sortField, sortDirection)}
              </th>
              <th className="sortable" onClick={() => handleSort('package_type')}>
                Package Type{getSortIndicator('package_type', sortField, sortDirection)}
              </th>
              <th>Customer</th>
              <th>Tracking Number</th>
              <th className="sortable" onClick={() => handleSort('transaction_amount')}>
                Amount{getSortIndicator('transaction_amount', sortField, sortDirection)}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map((transaction) => (
                <tr key={transaction.transaction_id}>
                  <td>{transaction.transaction_id}</td>
                  <td>{formatDate(transaction.transaction_date)}</td>
                  <td>{transaction.facility_name}</td>
                  <td>{transaction.package_type.charAt(0).toUpperCase() + transaction.package_type.slice(1)}</td>
                  <td>{transaction.customer_first_name} {transaction.customer_last_name}</td>
                  <td>{transaction.tracking_number}</td>
                  <td className="amount" style={ERROR_STATUSES.includes(transaction.package_status) ? { color: '#dc2626' } : {}}>
                    {ERROR_STATUSES.includes(transaction.package_status)
                      ? `-${formatCurrency(transaction.transaction_amount)}`
                      : formatCurrency(transaction.transaction_amount)
                    }
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                  No transactions match the selected filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionReport;
