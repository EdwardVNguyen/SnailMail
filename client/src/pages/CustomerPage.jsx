import './CustomerPage.css';

const CustomerPage = () => {
  return (
    <div className="customerPageContainer">
      <h1>Customer Dashboard</h1>
      <p>Welcome to your SnailMail account! Use the navigation menu above to manage your shipments and packages.</p>

      <h2>What You Can Do</h2>

      <h3>Your Shipments</h3>
      <p>Click on "Your Shipments" in the top menu to view all packages you've sent. Create new shipments, print shipping labels, and track the delivery status of your outgoing packages.</p>

      <h3>Tracking</h3>
      <p>Click on "Tracking" in the top menu to track any package. Enter a tracking number to see real-time updates on location, status, and estimated delivery time.</p>

      <h3>Profile</h3>
      <p>Click on "Profile" in the top right corner to view and update your personal information, address, and account settings.</p>

      <h3>Support</h3>
      <p>Click on "Support" in the top menu if you need assistance. Access our help center, contact customer service, and find answers to frequently asked questions.</p>

      <h3>About</h3>
      <p>Click on "About" to learn more about SnailMail, our services, and our commitment to reliable package delivery.</p>
    </div>
  );
};

export default CustomerPage;
