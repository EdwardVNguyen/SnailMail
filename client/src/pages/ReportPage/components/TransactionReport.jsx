import { useState, useMemo } from 'react';
import { sortData, getSortIndicator } from './reportUtils';

const TransactionReport = ({
  reportData,
  transactionStartDate,
  transactionEndDate,
  setTransactionStartDate,
  setTransactionEndDate,
  setTransactionDateRange
}) => {
  // Filter states
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [selectedPackageType, setSelectedPackageType] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState('all');

  // Sorting states
  const [sortField, setSortField] = useState('transaction_date');
  const [sortDirection, setSortDirection] = useState('desc');

  if (!reportData || !reportData.transactions) return <div>No data available</div>;

  // Extract unique facilities, package types, and customers for filters
  const facilities = useMemo(() => {
    const uniqueFacilities = [...new Set(reportData.transactions.map(t => ({
      id: t.facility_id,
      name: t.facility_name
    })).map(f => JSON.stringify(f)))].map(f => JSON.parse(f));
    return uniqueFacilities.sort((a, b) => a.name.localeCompare(b.name));
  }, [reportData.transactions]);

  const packageTypes = useMemo(() => {
    return [...new Set(reportData.transactions.map(t => t.package_type))].sort();
  }, [reportData.transactions]);

  const customers = useMemo(() => {
    const uniqueCustomers = [...new Set(reportData.transactions.map(t => ({
      id: t.customer_id,
      name: `${t.customer_first_name} ${t.customer_last_name}`
    })).map(c => JSON.stringify(c)))].map(c => JSON.parse(c));
    return uniqueCustomers.sort((a, b) => a.name.localeCompare(b.name));
  }, [reportData.transactions]);

  // Filter transactions based on selected filters
  const filteredTransactions = useMemo(() => {
    let filtered = reportData.transactions;

    if (selectedFacility !== 'all') {
      filtered = filtered.filter(t => t.facility_id === parseInt(selectedFacility));
    }

    if (selectedPackageType !== 'all') {
      filtered = filtered.filter(t => t.package_type === selectedPackageType);
    }

    if (selectedCustomer !== 'all') {
      filtered = filtered.filter(t => t.customer_id === parseInt(selectedCustomer));
    }

    return filtered;
  }, [reportData.transactions, selectedFacility, selectedPackageType, selectedCustomer]);

  // Calculate filtered summary stats
  const filteredSummary = useMemo(() => {
    const totalAmount = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.transaction_amount), 0);
    const avgAmount = filteredTransactions.length > 0 ? totalAmount / filteredTransactions.length : 0;
    return {
      count: filteredTransactions.length,
      totalAmount: totalAmount,
      avgAmount: avgAmount
    };
  }, [filteredTransactions]);

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
    setSelectedFacility('all');
    setSelectedPackageType('all');
    setSelectedCustomer('all');
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
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="filterSelect"
              >
                <option value="all">All Facilities</option>
                {facilities.map(facility => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
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
              <label>Customer:</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="filterSelect"
              >
                <option value="all">All Customers</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
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
            <div className="statValue">{formatCurrency(filteredSummary.totalAmount)}</div>
            <div className="statLabel">Total Revenue</div>
          </div>
          <div className="statCard">
            <div className="statValue">{formatCurrency(filteredSummary.avgAmount)}</div>
            <div className="statLabel">Average Amount</div>
          </div>
          <div className="statCard">
            <div className="statValue">{reportData.summary.total_transactions}</div>
            <div className="statLabel">All Transactions</div>
          </div>
          <div className="statCard">
            <div className="statValue">{formatCurrency(reportData.summary.total_revenue)}</div>
            <div className="statLabel">Total Period Revenue</div>
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
                  <td className="amount">{formatCurrency(transaction.transaction_amount)}</td>
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
