import { useState, useEffect } from 'react';
import './ReportPage.css';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import DetailSection from './ReportPage/components/DetailSection';
import FacilityReport from './ReportPage/components/FacilityReport';
import ClerkReport from './ReportPage/components/ClerkReport';
import CourierReport from './ReportPage/components/CourierReport';
import TransactionReport from './ReportPage/components/TransactionReport';

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
  const [transactionStartDate, setTransactionStartDate] = useState('');
  const [transactionEndDate, setTransactionEndDate] = useState('');

  // Modal state
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilityDetails, setFacilityDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [showClerkModal, setShowClerkModal] = useState(false);
  const [selectedClerk, setSelectedClerk] = useState(null);
  const [clerkDetails, setClerkDetails] = useState(null);
  const [loadingClerkDetails, setLoadingClerkDetails] = useState(false);

  const [showCourierModal, setShowCourierModal] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [courierDetails, setCourierDetails] = useState(null);
  const [loadingCourierDetails, setLoadingCourierDetails] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Sorting state for main facility table
  const [facilitySortField, setFacilitySortField] = useState('facility_name');
  const [facilitySortDirection, setFacilitySortDirection] = useState('asc');

  // Collapsed sections state (all start collapsed)
  const [collapsedSections, setCollapsedSections] = useState({
    packagesReceived: true,
    clerkCreatedEvents: true,
    packagesDelivered: true,
    packagesLost: true,
    backlog: true,
    statusInTransit: true,
    statusOutForDelivery: true
  });

  // Sorting state for detail tables
  const [detailSortField, setDetailSortField] = useState({});
  const [detailSortDirection, setDetailSortDirection] = useState({});

  // Pagination state for detail tables
  const [detailPages, setDetailPages] = useState({});

  // Initialize dates on component mount
  useEffect(() => {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];

    // All reports: Start from beginning of year or a far past date for "all time"
    const startDate = '2000-01-01'; // Far past date to capture all historical data

    setFacilityStartDate(startDate);
    setFacilityEndDate(endDate);
    setClerkStartDate(startDate);
    setClerkEndDate(endDate);
    setCourierStartDate(startDate);
    setCourierEndDate(endDate);
    setTransactionStartDate(startDate);
    setTransactionEndDate(endDate);
  }, []);

  // Helper function to get date range presets
  const getDateRange = (preset) => {
    const today = new Date();
    const toDate = today.toISOString().split('T')[0];
    let fromDate;

    switch (preset) {
      case 'all':
        fromDate = '2000-01-01'; // Far past date for "all time"
        break;
      case 'year':
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        fromDate = oneYearAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        fromDate = oneMonthAgo.toISOString().split('T')[0];
        break;
      case 'week':
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        fromDate = oneWeekAgo.toISOString().split('T')[0];
        break;
      default:
        fromDate = toDate;
    }

    return { fromDate, toDate };
  };

  // Preset handlers for each report type
  const setFacilityDateRange = (preset) => {
    const { fromDate } = getDateRange(preset);
    setFacilityEndDate(fromDate); // "To" field - the past date
  };

  const setClerkDateRange = (preset) => {
    const { fromDate } = getDateRange(preset);
    setClerkEndDate(fromDate); // "To" field - the past date
  };

  const setCourierDateRange = (preset) => {
    const { fromDate } = getDateRange(preset);
    setCourierEndDate(fromDate); // "To" field - the past date
  };

  const setTransactionDateRange = (preset) => {
    const { fromDate } = getDateRange(preset);
    setTransactionEndDate(fromDate); // "To" field - the past date
  };

  // Sorting function for main facility table
  const handleFacilitySort = (field) => {
    if (facilitySortField === field) {
      setFacilitySortDirection(facilitySortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setFacilitySortField(field);
      setFacilitySortDirection('asc');
    }
  };


  // Handle facility row click to show details modal
  const handleFacilityRowClick = async (facility) => {
    setSelectedFacility(facility);
    setShowFacilityModal(true);
    setLoadingDetails(true);
    setFacilityDetails(null);

    // Reset collapsed sections and pagination
    setCollapsedSections({
      packagesReceived: true,
      clerkCreatedEvents: true,
      packagesDelivered: true,
      packagesLost: true,
      packagesSent: true,
      backlog: true,
      statusInTransit: true,
      statusOutForDelivery: true
    });
    setDetailPages({});
    setDetailSortField({});
    setDetailSortDirection({});

    try {
      const url = `${import.meta.env.VITE_API_URL}/getFacilityDetails?facilityId=${facility.facility_id}&startDate=${facilityStartDate}&endDate=${facilityEndDate}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setFacilityDetails(data);
        const initialPages = {};
        Object.keys(data.details).forEach(key => {
          initialPages[key] = 1;
        });
        setDetailPages(initialPages);
      } else {
        setToastMessage(data.message || 'Failed to fetch facility details');
        setToastType('error');
        setShowToast(true);
        setShowFacilityModal(false);
      }
    } catch (error) {
      console.error('Error fetching facility details:', error);
      setToastMessage('Failed to fetch facility details. Please try again.');
      setToastType('error');
      setShowToast(true);
      setShowFacilityModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle clerk row click to show details modal
  const handleClerkRowClick = async (clerk) => {
    setSelectedClerk(clerk);
    setShowClerkModal(true);
    setLoadingClerkDetails(true);
    setClerkDetails(null);

    setCollapsedSections({
      reviewsApproved: true,
      reviewsRejected: true,
      trackingEvents: true,
      problemPackages: true,
      packagesProcessed: true
    });
    setDetailPages({});
    setDetailSortField({});
    setDetailSortDirection({});

    try {
      const url = `${import.meta.env.VITE_API_URL}/getClerkDetails?employeeId=${clerk.employee_id}&startDate=${clerkStartDate}&endDate=${clerkEndDate}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setClerkDetails(data);
        const initialPages = {};
        Object.keys(data.details).forEach(key => {
          initialPages[key] = 1;
        });
        setDetailPages(initialPages);
      } else {
        setToastMessage(data.message || 'Failed to fetch clerk details');
        setToastType('error');
        setShowToast(true);
        setShowClerkModal(false);
      }
    } catch (error) {
      console.error('Error fetching clerk details:', error);
      setToastMessage('Failed to fetch clerk details. Please try again.');
      setToastType('error');
      setShowToast(true);
      setShowClerkModal(false);
    } finally {
      setLoadingClerkDetails(false);
    }
  };

  // Handle courier row click to show details modal
  const handleCourierRowClick = async (courier) => {
    setSelectedCourier(courier);
    setShowCourierModal(true);
    setLoadingCourierDetails(true);
    setCourierDetails(null);

    setCollapsedSections({
      packagesClaimed: true,
      packagesDelivered: true,
      packagesInTransit: true,
      packagesLost: true,
      facilityTransfers: true,
      finalDeliveries: true,
      allTrackingEvents: true
    });
    setDetailPages({});
    setDetailSortField({});
    setDetailSortDirection({});

    try {
      const url = `${import.meta.env.VITE_API_URL}/getCourierDetails?employeeId=${courier.employee_id}&startDate=${courierStartDate}&endDate=${courierEndDate}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setCourierDetails(data);
        const initialPages = {};
        Object.keys(data.details).forEach(key => {
          initialPages[key] = 1;
        });
        setDetailPages(initialPages);
      } else {
        setToastMessage(data.message || 'Failed to fetch courier details');
        setToastType('error');
        setShowToast(true);
        setShowCourierModal(false);
      }
    } catch (error) {
      console.error('Error fetching courier details:', error);
      setToastMessage('Failed to fetch courier details. Please try again.');
      setToastType('error');
      setShowToast(true);
      setShowCourierModal(false);
    } finally {
      setLoadingCourierDetails(false);
    }
  };

  // Toggle section collapse/expand
  const handleSectionToggle = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle sorting for detail tables
  const handleDetailSort = (section, field) => {
    if (detailSortField[section] === field) {
      setDetailSortDirection(prev => ({
        ...prev,
        [section]: prev[section] === 'asc' ? 'desc' : 'asc'
      }));
    } else {
      setDetailSortField(prev => ({ ...prev, [section]: field }));
      setDetailSortDirection(prev => ({ ...prev, [section]: 'asc' }));
    }
  };

  // Handle page change for detail tables
  const handlePageChange = (section, direction) => {
    setDetailPages(prev => {
      const currentPage = prev[section] || 1;
      const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
      return { ...prev, [section]: Math.max(1, newPage) };
    });
  };

  // Fetch report data when active report changes or dates change
  useEffect(() => {
    let cancelled = false;

    const fetchReportData = async (reportType) => {
      // Don't fetch if dates aren't initialized yet
      if (reportType === 'facility' && (!facilityStartDate || !facilityEndDate)) return;
      if (reportType === 'clerk' && (!clerkStartDate || !clerkEndDate)) return;
      if (reportType === 'courier' && (!courierStartDate || !courierEndDate)) return;
      if (reportType === 'transaction' && (!transactionStartDate || !transactionEndDate)) return;

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
          case 'transaction':
            endpoint = 'getTransactionReport';
            url = `${import.meta.env.VITE_API_URL}/${endpoint}?startDate=${transactionStartDate}&endDate=${transactionEndDate}`;
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
  }, [activeReport, facilityStartDate, facilityEndDate, clerkStartDate, clerkEndDate, courierStartDate, courierEndDate, transactionStartDate, transactionEndDate]);


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

          <div
            className={`reportMenuItem ${activeReport === 'transaction' ? 'active' : ''}`}
            onClick={() => setActiveReport('transaction')}
          >
            <div className="menuItemTitle">Transaction Report</div>
            <div className="menuItemDesc">Financial transactions by facility</div>
          </div>
        </div>

        {/* Right side report display */}
        <div className="reportDisplay">
          {loading ? (
            <div className="loadingMessage">Loading report...</div>
          ) : reportData ? (
            <>
              {activeReport === 'facility' && <FacilityReport reportData={reportData} facilityStartDate={facilityStartDate} facilityEndDate={facilityEndDate} setFacilityStartDate={setFacilityStartDate} setFacilityEndDate={setFacilityEndDate} setFacilityDateRange={setFacilityDateRange} facilitySortField={facilitySortField} facilitySortDirection={facilitySortDirection} handleFacilitySort={handleFacilitySort} handleFacilityRowClick={handleFacilityRowClick} />}
              {activeReport === 'clerk' && <ClerkReport reportData={reportData} clerkStartDate={clerkStartDate} clerkEndDate={clerkEndDate} setClerkStartDate={setClerkStartDate} setClerkEndDate={setClerkEndDate} setClerkDateRange={setClerkDateRange} handleClerkRowClick={handleClerkRowClick} />}
              {activeReport === 'courier' && <CourierReport reportData={reportData} courierStartDate={courierStartDate} courierEndDate={courierEndDate} setCourierStartDate={setCourierStartDate} setCourierEndDate={setCourierEndDate} setCourierDateRange={setCourierDateRange} handleCourierRowClick={handleCourierRowClick} />}
              {activeReport === 'transaction' && <TransactionReport reportData={reportData} transactionStartDate={transactionStartDate} transactionEndDate={transactionEndDate} setTransactionStartDate={setTransactionStartDate} setTransactionEndDate={setTransactionEndDate} setTransactionDateRange={setTransactionDateRange} />}
            </>
          ) : (
            <div className="loadingMessage">No data available</div>
          )}
        </div>
      </div>

      {/* Facility Details Modal */}
      {showFacilityModal && (
        <Modal
          show={true}
          title={selectedFacility ? `${selectedFacility.facility_name} - Details` : 'Facility Details'}
          onClose={() => setShowFacilityModal(false)}
        >
          {loadingDetails ? (
            <div className="loadingMessage">Loading details...</div>
          ) : facilityDetails ? (
            <div className="facilityDetailsContent">
              {/* Summary header */}
              <div className="facilityDetailsSummary">
                <p><strong>Address:</strong> {facilityDetails.facility.facility_address}</p>
                <div className="summaryStats">
                  <span><strong>Received:</strong> {facilityDetails.details.packagesReceived.length}</span>
                  <span><strong>Clerk Events:</strong> {facilityDetails.details.clerkCreatedEvents.length}</span>
                  <span><strong>Delivered:</strong> {facilityDetails.details.packagesDelivered.length}</span>
                  <span><strong>Lost:</strong> {facilityDetails.details.packagesLost.length}</span>
                  <span><strong>Backlog:</strong> {facilityDetails.details.backlog.length}</span>
                </div>
              </div>

              {/* Collapsible sections */}
              <DetailSection sectionKey="packagesReceived" title="Packages Received" data={facilityDetails.details.packagesReceived} extraColumn={{ field: 'courier_name', label: 'Courier' }} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="clerkCreatedEvents" title="Clerk Created Events" data={facilityDetails.details.clerkCreatedEvents} extraColumn={[{ field: 'event_type', label: 'Event Type' }, { field: 'clerk_name', label: 'Clerk' }]} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="packagesDelivered" title="Packages Delivered" data={facilityDetails.details.packagesDelivered} extraColumn={{ field: 'delivered_by', label: 'Delivered By' }} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="packagesLost" title="Problem Packages" data={facilityDetails.details.packagesLost} extraColumn={[{ field: 'marked_by', label: 'Marked By' }, { field: 'last_courier', label: 'Last Courier' }]} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="packagesSent" title="Packages Sent" data={facilityDetails.details.packagesSent} extraColumn={{ field: 'destination_facility', label: 'Destination Facility' }} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="backlog" title="Backlog" data={facilityDetails.details.backlog} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="statusInTransit" title="Status: In Transit" data={facilityDetails.details.statusInTransit} extraColumn={{ field: 'courier_name', label: 'Courier' }} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="statusOutForDelivery" title="Status: Out for Delivery" data={facilityDetails.details.statusOutForDelivery} extraColumn={{ field: 'courier_name', label: 'Courier' }} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
            </div>
          ) : (
            <div>No details available</div>
          )}
        </Modal>
      )}

      {/* Clerk Details Modal */}
      {showClerkModal && (
        <Modal
          show={true}
          title={selectedClerk ? `${selectedClerk.clerk_name} - Details` : 'Clerk Details'}
          onClose={() => setShowClerkModal(false)}
        >
          {loadingClerkDetails ? (
            <div className="loadingMessage">Loading details...</div>
          ) : clerkDetails ? (
            <div className="facilityDetailsContent">
              <div className="facilityDetailsSummary">
                <p><strong>Facility:</strong> {clerkDetails.clerk.facility_name}</p>
                <div className="summaryStats">
                  <span><strong>Approved:</strong> {clerkDetails.details.reviewsApproved.length}</span>
                  <span><strong>Rejected:</strong> {clerkDetails.details.reviewsRejected.length}</span>
                  <span><strong>Events:</strong> {clerkDetails.details.trackingEvents.length}</span>
                  <span><strong>Problems:</strong> {clerkDetails.details.problemPackages.length}</span>
                  <span><strong>Processed:</strong> {clerkDetails.details.packagesProcessed.length}</span>
                </div>
              </div>

              <DetailSection sectionKey="reviewsApproved" title="Reviews Approved" data={clerkDetails.details.reviewsApproved} extraColumn={{ field: 'courier_name', label: 'Courier' }} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="reviewsRejected" title="Reviews Rejected" data={clerkDetails.details.reviewsRejected} extraColumn={{ field: 'courier_name', label: 'Courier' }} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="trackingEvents" title="Tracking Events Created" data={clerkDetails.details.trackingEvents} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="problemPackages" title="Problem Packages" data={clerkDetails.details.problemPackages} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="packagesProcessed" title="Packages Processed" data={clerkDetails.details.packagesProcessed} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
            </div>
          ) : (
            <div>No details available</div>
          )}
        </Modal>
      )}

      {/* Courier Details Modal */}
      {showCourierModal && (
        <Modal
          show={true}
          title={selectedCourier ? `${selectedCourier.courier_name} - Details` : 'Courier Details'}
          onClose={() => setShowCourierModal(false)}
        >
          {loadingCourierDetails ? (
            <div className="loadingMessage">Loading details...</div>
          ) : courierDetails ? (
            <div className="facilityDetailsContent">
              <div className="facilityDetailsSummary">
                <div className="summaryStats">
                  <span><strong>Claimed:</strong> {courierDetails.details.packagesClaimed.length}</span>
                  <span><strong>Delivered:</strong> {courierDetails.details.packagesDelivered.length}</span>
                  <span><strong>In Transit:</strong> {courierDetails.details.packagesInTransit.length}</span>
                  <span><strong>Lost:</strong> {courierDetails.details.packagesLost.length}</span>
                </div>
              </div>

              <DetailSection sectionKey="packagesClaimed" title="Packages Claimed" data={courierDetails.details.packagesClaimed} extraColumn={{ field: 'reviewed_by_name', label: 'Approved By' }} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="packagesDelivered" title="Packages Delivered" data={courierDetails.details.packagesDelivered} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="packagesInTransit" title="Packages In Transit" data={courierDetails.details.packagesInTransit} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="packagesLost" title="Packages Lost" data={courierDetails.details.packagesLost} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="facilityTransfers" title="Facility Transfers" data={courierDetails.details.facilityTransfers} extraColumn={{ field: 'destination_facility', label: 'Destination' }} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="finalDeliveries" title="Final Deliveries" data={courierDetails.details.finalDeliveries} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
              <DetailSection sectionKey="allTrackingEvents" title="All Tracking Events" data={courierDetails.details.allTrackingEvents} collapsedSections={collapsedSections} detailPages={detailPages} detailSortField={detailSortField} detailSortDirection={detailSortDirection} onSectionToggle={handleSectionToggle} onDetailSort={handleDetailSort} onPageChange={handlePageChange} />
            </div>
          ) : (
            <div>No details available</div>
          )}
        </Modal>
      )}

      {/* Toast Notification */}
      <Toast
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default ReportPage;
