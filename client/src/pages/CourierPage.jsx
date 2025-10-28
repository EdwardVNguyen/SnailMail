import './CustomerPage.css';

const CourierPage = ( {globalAuthId } ) => {
  return (
    <div className="customerPageContainer">
      <h1>Courier Dashboard</h1>
      <p>Welcome to your SnailMail courier account! Use the navigation menu above to manage your package deliveries.</p>

      <h2>What You Can Do</h2>

      <h3>Move Packages</h3>
      <p>Click on "Move Packages" in the top menu to update package locations and statuses. Scan packages, record deliveries, mark packages as in transit, and update tracking information in real-time.</p>
    </div>
  );
};

export default CourierPage;
